import { Types } from '../Core/Types'
import { AppTestHarness } from '../TestTools/AppTestHarness'
import { Router } from '../Routing/Router'
import { RouterRepository } from '../Routing/RouterRepository'
import { LoginRegisterPresenter } from './LoginRegisterPresenter'
import { GetSuccessfulRegistrationStub } from '../TestTools/GetSuccessfulRegistrationStub'
import { AuthenticationRepository } from './AuthenticationRepository'

let appTestHarness = null
let loginRegisterPresenter = null
let router = null
let routerRepository = null
let routerGateway = null
let onRouteChange = null
let authenticationRepository = null

describe('init', () => {
  beforeEach(() => {
    appTestHarness = new AppTestHarness()
    appTestHarness.init()
    router = appTestHarness.container.get(Router)
    routerRepository = appTestHarness.container.get(RouterRepository)
    routerGateway = appTestHarness.container.get(Types.IRouterGateway)
    authenticationRepository = appTestHarness.container.get(AuthenticationRepository)
    onRouteChange = () => {}
  })

  it('should be an null route', () => {
    expect(routerRepository.currentRoute.routeId).toBe(null)
  })

  describe('bootstrap', () => {
    beforeEach(() => {
      appTestHarness.bootStrap(onRouteChange)
    })

    it('should start at null route', () => {
      expect(routerRepository.currentRoute.routeId).toBe(null)
    })

    describe('routing', () => {
      it('should block wildcard *(default) routes when not logged in', () => {
        router.goToId('default')

        expect(routerGateway.goToId).toHaveBeenLastCalledWith('loginLink')
      })

      it('should block secure routes when not logged in', () => {
        router.goToId('homeLink')

        expect(routerGateway.goToId).toHaveBeenLastCalledWith('loginLink')
      })

      it('should allow public route when not logged in', () => {
        router.goToId('authorPolicyLink')

        expect(routerGateway.goToId).toHaveBeenLastCalledWith('authorPolicyLink')
      })
    })

    describe('register', async () => {
      console.log('dataGateway =', authenticationRepository.dataGateway)
      authenticationRepository.dataGateway.post = jest.fn().mockImplementation(() => {
        Promise.resolve(GetSuccessfulRegistrationStub())
      })
      loginRegisterPresenter = appTestHarness.container.get(LoginRegisterPresenter)

      loginRegisterPresenter.email = 'a@b.com'
      loginRegisterPresenter.password = '123456'

      await loginRegisterPresenter.register()

      expect(loginRegisterPresenter.showValidationWarning).toBe(false)
      expect(loginRegisterPresenter.messages).toEqual(['User registered'])
      console.log('loginRegisterPresenter.messages=', loginRegisterPresenter.messages)
    })
  })
})
