import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: 'VEILAGENT — On-Device Privacy Browser Agent',
  version: '1.0.0',
  description: 'On-device visual perception and privacy firewall for lightweight browser agents (SIH/ISRO 26171).',
  permissions: [
    'activeTab',
    'scripting',
    'storage',
    'offscreen'
  ],
  host_permissions: [
    'http://localhost:3000/*',
    'http://localhost:8000/*',
    'http://127.0.0.1:*/*',
    'https://*/*'
  ],
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'VEILAGENT Privacy Agent'
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: [
        'http://localhost:3000/*',
        'http://localhost:3001/*',
        'http://localhost:8080/*',
        'http://127.0.0.1:*/*',
        '<all_urls>'
      ],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle'
    }
  ],
  web_accessible_resources: [
    {
      resources: ['models/*', 'assets/*'],
      matches: ['<all_urls>']
    }
  ]
}));
