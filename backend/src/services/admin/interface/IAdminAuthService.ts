export interface IAdminAuthService{
    checkActiveStatus(id:string):Promise<boolean>
}