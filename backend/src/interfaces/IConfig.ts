interface IConfig {
    port: number;
    tokenKey: string;
    mongoURL: string;
    secure?: {
        key: string;
        cert: string;
    };
    frontend?: {
        route: string;
        path: string;
    }
}

export default IConfig;
