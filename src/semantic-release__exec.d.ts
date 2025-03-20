declare module '@semantic-release/exec' {
  interface Options {
    verifyConditionsCmd?: string;
    analyzeCommitsCmd?: string;
    verifyReleaseCmd?: string;
    generateNotesCmd?: string;
    prepareCmd?: string;
    addChannelCmd?: string;
    publishCmd?: string;
    successCmd?: string;
    failCmd?: string;
    shell?: string;
    execCwd?: string;
  }
}
