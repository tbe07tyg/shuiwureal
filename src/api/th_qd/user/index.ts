import request from '@/config/axios'

//获得登录用户信息
export const thQdUserGetLoginUserInfo = () => {
    return request.post({
    method: 'get',
    url: `/system/user/profile/get`,
    });
}
