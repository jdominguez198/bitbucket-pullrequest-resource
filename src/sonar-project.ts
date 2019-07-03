import * as fs from 'fs';
import { Logger } from './logger';
import { PullRequestResponse } from './bitbucket';
import { Version } from './concourse';

export interface SonarConfiguration {
    id: string;
    branch: string;
    base: string;
}

export class SonarProjectWriter{
    private _logger: Logger;
    private _pr: PullRequestResponse;
    private _version: Version;
    private _file: string;

    constructor(logger: Logger, pr: PullRequestResponse, version: Version) {
        this._logger = logger;
        this._pr = pr;
        this._version = version;
        this._file = 'sonar-project.properties';
    }

    async write(repoPath: string) {
        try {
            const filePath = `${repoPath}/${this._file}`;
            await fs.promises.access(filePath);

            const sonarConf: SonarConfiguration = this.getSonarData();
            const stream = fs.createWriteStream(filePath, {flags: 'a'});
            stream.write(`sonar.pullrequest.branch=${sonarConf.branch}\n`);
            stream.write(`sonar.pullrequest.key=${sonarConf.id}\n`);
            stream.write(`sonar.pullrequest.base=${sonarConf.base}\n`);
            stream.end();
        } catch (error) {
            this._logger.info('The file sonar-project.properties does not exists or is not writable');
        }
    }

    private getSonarData(): SonarConfiguration {
        return {
            id: this._pr.id,
            branch: this._version.branch,
            base: this._pr.destination.branch.name,
        };
    }
}
