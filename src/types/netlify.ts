export type NetlifyBuild = {
  id?: string;
  deploy_id?: string;
  sha?: string;
  done?: boolean;
  error?: string;
  created_at?: string;
}

export type NetlifyClient = {
  getLatestBuilds: () => Promise<NetlifyBuild[]>;
  cancelDeploy: (deployId: string) => Promise<any>;
  triggerBuild: (title: string) => Promise<any>;
}
