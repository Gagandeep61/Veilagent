import { ActionResponse } from '../shared/types';
import { GuardEvaluation } from './action-guard';

export interface ExecutionResult {
  success: boolean;
  message: string;
  actionExecuted: string;
}

export function executeGuardedAction(
  action: ActionResponse,
  guardResult: GuardEvaluation
): ExecutionResult {
  if (!guardResult.allowed) {
    return {
      success: false,
      message: `Action blocked by Local Action Guard: ${guardResult.reason}`,
      actionExecuted: action.action,
    };
  }

  if (action.action === 'scroll') {
    const amount = action.amount || 300;
    const direction = action.direction === 'up' ? -1 : 1;
    window.scrollBy({
      top: amount * direction,
      behavior: 'smooth',
    });
    return {
      success: true,
      message: `Scrolled page ${action.direction} by ${amount}px`,
      actionExecuted: `scroll(${action.direction}, ${amount}px)`,
    };
  }

  if (action.action === 'click' && guardResult.targetElement) {
    const el = guardResult.targetElement;

    // Visual ripple effect for demonstration feedback
    const prevOutline = el.style.outline;
    el.style.outline = '3px solid #22c55e';
    setTimeout(() => {
      el.style.outline = prevOutline;
    }, 1200);

    // Scroll into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Trigger click event
    el.click();

    return {
      success: true,
      message: `Executed click on element '${action.element_id}'`,
      actionExecuted: `click(${action.element_id})`,
    };
  }

  return {
    success: false,
    message: 'Unable to execute action: No valid DOM target or handler.',
    actionExecuted: action.action,
  };
}
