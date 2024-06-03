class AppDeps {
    deps: Map<string, any> = new Map();

    constructor() {
        console.log('constructing AppDeps');
    }

    setDep(name: string, obj: any): void {
        console.debug('setting dep ', name); 
        this.deps.set(name, obj);
    }

    getDep(name: string): any {
        console.debug('getting dep ', name); 
        return this.deps.get(name);
    }
}

const appDeps = new AppDeps();


export const getAppDeps = () => {
    return appDeps;
}