import router from '@adonisjs/core/services/router'

router.where('id', router.matchers.uuid())

router.get('/', () => {
  return { hello: 'world' }
})
