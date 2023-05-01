import express, { Response } from 'express';
import { leaderElectionRouter } from './leader-election.router.js';
import { infoln, errorln } from './utils.js';

export async function startServer(): Promise<void> {
    const server = express();
    const port: number = 3000;

    server.use(express.json());
    server.use(express.urlencoded({
        extended: true,
    }));

    server.get('/', (_, response: Response) => {
        response.send('CoIDS peer server works!');
    });

    server.use('/leaderelection', leaderElectionRouter);

    server.listen(port, () => {
        infoln(`\nCoIDS peer listening on port ${port}`);
    });
}

await startServer().catch((err) => {
    errorln('Error while trying to start CoIDS peer server');
    console.log(err);
});
