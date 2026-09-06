import { server_url } from './config';

export const ENDPOINTS = {
  login: `${server_url}login`,
  register: `${server_url}register`,
  verifyCodeEmail: `${server_url}email_verification`,
  resendVerificationEmail: `https://app.fadiar.com:444/prueba/api/resend_verification_email`,
  recoverCredentialsByEmail: `${server_url}recuperar_credenciales_por_correo`,
  refreshToken: `${server_url}refresh_token`,
  logout: `${server_url}logout`,

  getUserImageName: `${server_url}getUserImageName`,
  editUser: `${server_url}editUser`,

  addProductToCart: `${server_url}agregar_producto_carrito`,
  deleteProductFromCart: `${server_url}eliminar_producto_carrito`,
  getCartProducts: `${server_url}obtener_productos_carrito`,
  updateCartQuantity: `${server_url}modificar_cantidad_producto_carrito`,

  inventoryManager: `${server_url}inventory_manager`,
  latestProducts: `${server_url}getNewerProducts`,
  bestSelling: `${server_url}img_mas_vendido`,
  mostViewed: `${server_url}img_mas_vendido`,
  upcomingProducts: `${server_url}inventory_new_releases_manager`,
  getProductForVisual: `${server_url}getProductForVisual`,

  provincesMunicipalities: `${server_url}obtener_provincias_municipios`,

  addOrder: `${server_url}add_order`,
  getOrders: `${server_url}pedidos_manager`,
  getOrderProducts: `${server_url}getOrder`,
  getOrderNote: `${server_url}get_messages`,
  denyOrder: `${server_url}denegar_pedido`,

  getAddresses: `${server_url}obtener_direccion_domicilio_cliente`,
  addAddress: `${server_url}crear_direccion_domicilio_cliente`,
  editAddress: `${server_url}editar_direccion_domicilio_cliente`,
  deleteAddress: `${server_url}eliminar_direccion_domicilio_cliente`,

  statisticsAboutUs: `${server_url}estadisticas_acerca_de_nosotros`,
} as const;