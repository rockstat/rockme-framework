class AppDeps {
    deps: Map<string, any> = new Map();
    
    setDep(name: string, obj: any): void {
        this.deps.set(name, obj);
    }

    getDep(name: string): any {
        return this.deps.get(name);
    }
}

const appDeps = new AppDeps();


export const getAppDeps = () => {
    return appDeps;
}
