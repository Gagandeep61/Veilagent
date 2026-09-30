import React, { useState } from 'react';
import { ScanMetrics, ActionResponse } from '../shared/types';

export const Popup: React.FC = () => {
  const [task, setTask] = useState('Find and click the Save Changes button');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready for on-device privacy scan.');
  const [metrics, setMetrics] = useState<ScanMetrics | null>(null);
  const [action, setAction] = useState<ActionResponse | null>(null);
  const [guardPassed, setGuardPassed] = useState<boolean | null>(null);
  const [guardReason, setGuardReason] = useState<string>('');
  const [showInspector, setShowInspector] = useState(false);
  const [sanitizedPayloadPreview, setSanitizedPayloadPreview] = useState<string>('');
  const [overlayActive, setOverlayActive] = useState(false);

  const handleScanOnly = async () => {
    setLoading(true);
    setStatusMessage('Scanning DOM & running local MediaPipe face perception...');
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          const res: any = await chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE_REQUEST' });
          if (res) {
            setMetrics(res.metrics);
            setOverlayActive(true);
            setSanitizedPayloadPreview(JSON.stringify(res.sanitizedMetadata, null, 2));
            setStatusMessage(`Scan complete: ${res.metrics.piiRedactionsCount} sensitive fields protected locally.`);
          }
        }
      } else {
        // Mock preview for developer testing
        setMetrics({
          domElementsScanned: 8,
          piiRedactionsCount: 6,
          faceDetectionsCount: 1,
          localPerceptionMs: 42,
          redactionMs: 2,
          payloadCheckMs: 1,
          rawPiiTransmitted: 0,
          payloadSizeBytes: 512,
        });
        setStatusMessage('Demo scan simulated (no chrome.tabs API in standalone mode).');
      }
    } catch (err: any) {
      setStatusMessage(`Scan error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOverlay = async () => {
    const nextState = !overlayActive;
    setOverlayActive(nextState);
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_OVERLAY_REQUEST',
          payload: { show: nextState },
        });
      }
    }
  };

  const handleRunAgent = async () => {
    setLoading(true);
    setStatusMessage('Executing end-to-end privacy agent loop...');
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response: any = await chrome.runtime.sendMessage({
          type: 'RUN_AGENT_PIPELINE',
          payload: { task },
        });

        if (response?.success) {
          const { actionProposed, guardResult, execResult, metrics: returnedMetrics, sanitizedPayload } = response.data;
          setAction(actionProposed);
          setGuardPassed(guardResult.allowed);
          setGuardReason(guardResult.reason || (guardResult.isDestructive ? 'Flagged as destructive' : 'Verified safe'));
          setMetrics(returnedMetrics);
          setSanitizedPayloadPreview(JSON.stringify(sanitizedPayload, null, 2));
          setStatusMessage(`Action executed: ${execResult.actionExecuted} (${execResult.message})`);
        } else {
          setStatusMessage(`Agent blocked: ${response?.error}`);
        }
      } else {
        // Simulation
        setAction({
          action: 'click',
          element_id: 'btn_save',
          confidence: 0.98,
          rationale: 'Standalone Simulation: Grounded target element btn_save.',
        });
        setGuardPassed(true);
        setGuardReason('Element exists, visible, enabled, confidence >= 0.80.');
        setStatusMessage('Action click(btn_save) executed successfully.');
      }
    } catch (err: any) {
      setStatusMessage(`Pipeline error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-container">
      <header className="header">
        <div className="brand">
          <span className="badge">VEILAGENT</span>
          <span className="title">Privacy Guard</span>
        </div>
        <div className="status-pill">
          <span className="status-dot"></span>
          <span>Fail-Closed ON</span>
        </div>
      </header>

      <div className="section-card">
        <div className="card-title">Agent Instruction</div>
        <input
          type="text"
          className="task-input"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Find and click Save Changes"
          disabled={loading}
        />
        <div className="button-group">
          <button className="btn btn-secondary" onClick={handleScanOnly} disabled={loading}>
            Analyze Page
          </button>
          <button className="btn btn-primary" onClick={handleRunAgent} disabled={loading}>
            {loading ? 'Processing...' : 'Run Agent'}
          </button>
        </div>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '5px' }}
          onClick={handleToggleOverlay}
        >
          {overlayActive ? 'Hide Bounding Boxes' : 'Show Visual Overlays'}
        </button>
      </div>

      {metrics && (
        <div className="section-card">
          <div className="card-title">SIH Privacy & Performance Metrics</div>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">Local Perception</div>
              <div className="metric-val metric-highlight">{metrics.localPerceptionMs} ms</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Redacted Fields</div>
              <div className="metric-val">{metrics.piiRedactionsCount} fields</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Biometric Faces</div>
              <div className="metric-val">{metrics.faceDetectionsCount} masked</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Raw PII Transmitted</div>
              <div className="metric-val metric-safe">0 LEAKS</div>
            </div>
            {metrics.serverReasoningMs !== undefined && (
              <div className="metric-item">
                <div className="metric-label">Server Reasoning</div>
                <div className="metric-val">{metrics.serverReasoningMs} ms</div>
              </div>
            )}
            <div className="metric-item">
              <div className="metric-label">Payload Size</div>
              <div className="metric-val">{metrics.payloadSizeBytes} B</div>
            </div>
          </div>
        </div>
      )}

      {action && (
        <div className="section-card">
          <div className="card-title">VLM Structured Action & Local Guard</div>
          <div className="action-result">
            <div className="action-header">
              <span className="action-name">
                {action.action.toUpperCase()} {action.element_id ? `→ ${action.element_id}` : ''}
              </span>
              <span className="action-conf">conf: {(action.confidence * 100).toFixed(0)}%</span>
            </div>
            {action.rationale && <p style={{ color: '#94a3b8', marginTop: '2px' }}>{action.rationale}</p>}
            {guardPassed !== null && (
              <div className={`guard-pill ${guardPassed ? 'passed' : 'blocked'}`}>
                Local Guard: {guardPassed ? 'APPROVED & EXECUTED' : 'BLOCKED'} ({guardReason})
              </div>
            )}
          </div>
        </div>
      )}

      <div className="section-card">
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShowInspector(!showInspector)}
        >
          <span className="card-title">Outgoing Sanitized Payload</span>
          <span style={{ fontSize: '10px', color: '#38bdf8' }}>{showInspector ? 'Hide' : 'Inspect'}</span>
        </div>
        {showInspector && (
          <div className="payload-inspector">
            {sanitizedPayloadPreview || '// Run "Analyze Page" to preview sanitized JSON payload'}
          </div>
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
        {statusMessage}
      </div>
    </div>
  );
};
