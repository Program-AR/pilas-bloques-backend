import { User } from '../../models/user'
import { newToken } from '../models/auth'
import { pilasBloquesLogo, programarLogo, sadoskyLogo, totoGlass } from './attatchments'

const APP_PASSWORD_RECOVERY_URL = `${process.env.API_APP_URL}${process.env.PASSWORD_RECOVERY_PATH}`
const PASSWORD_RECOVERY_EXPIRATION_DAYS = parseInt(process.env.PASSWORD_RECOVERY_EXPIRATION_DAYS)

const escapeHtml = (text: string) => {
  return (text || '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&#39;'
      default: return char
    }
  })
}

export const passwordRecoveryMail = (user: User) => {
  const name = escapeHtml(user.profile?.nickName || user.username || '')
  const url = `${APP_PASSWORD_RECOVERY_URL}?token=${newToken(user, PASSWORD_RECOVERY_EXPIRATION_DAYS)}`
  return createMail(user.email, "Cambiar tu contraseña de Pilas Bloques", `
    <img src="cid:${totoGlass.cid}" style="float:right"/>
    <p>¡Hola ${name}!</p>
    <p>Estás recibiendo este correo electrónico porque alguien pidió <strong>restablecer tu contraseña</strong> en Pilas Bloques. Si no fuiste vos, podés descartar este mensaje.</p>
    <p>Si no utilizas este enlace en un plazo de 3 días, caducará.</p>
    <p>
      Para restablecer tu contraseña, entrá acá y seguí los pasos:<br/>
      <a href="${url}" style="color:${colors.link}">${url}</a>
    </p>`)
}

export const forumVerificationMail = (user: User, email: string, code: string) => {
  const name = escapeHtml(user.profile?.nickName || user.username || '')
  return createMail(email, "Código de ingreso al Foro de Pilas Bloques", `
    <img src="cid:${totoGlass.cid}" style="float:right"/>
    <p>¡Hola ${name}!</p>
    <p>Estás recibiendo este correo porque solicitaste ingresar a la <strong>Comunidad de Pilas Bloques</strong>.</p>
    <p>Tu código de verificación es:</p>
    <p style="text-align: center; margin: 20px 0;">
      <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; background: #E8F4F8; padding: 10px 20px; border-radius: 8px; color: ${colors.link};">
        ${escapeHtml(code)}
      </span>
    </p>
    <p>Este código tiene una validez de <strong>15 minutos</strong>. Si no solicitaste ingresar, podés ignorar este correo.</p>
  `)
}

const createMail = (to: string, subject: string, content: string) => ({
  from: `Pilas Bloques <${process.env.SMTP_USER}>`,
  to: to,
  attachments: [pilasBloquesLogo, programarLogo, sadoskyLogo, totoGlass],
  subject: subject,
  html: `
        <div style='background:#F1F1F1; padding:30px;'>
          <div style='background:#FAFAFA; color:#777; font-family:Roboto, "Helvetica Neue", sans-serif; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.24)'>
            <h3 style='background:#DFDBDB; padding:20px; margin:0; border-radius: 10px 10px 0px 0px; font-size:22px'>
              ${subject}
            </h3>
            <div style='padding: 0px 20px 20px 20px; font-size:16px'>
              ${applyStyles(content)}
              <p>
                Saludos,
              </p>
              ${signature}
            </div>
          </div>
        </div>
      `
})

export const pilasBloquesEmail = "pilasbloques@program.ar"

const colors = {
  link: '#4EC2DF'
}

const signature = `
  <table style="margin:0px; font-size:9pt" width="100%" border="0">
    <tbody>
      <tr valign="middle">
      <td style="vertical-align:top; padding:1px 20px 1px 4px; border-right:2px solid ${colors.link}" width="150">
        <img src="cid:${pilasBloquesLogo.cid}" /><br>
        <img src="cid:${programarLogo.cid}" /><br>
        <img src="cid:${sadoskyLogo.cid}" />
      </td>
      <td style="vertical-align:top; padding:1px 4px 1px 20px">
        <p style="margin:0px;padding:0px 0px 5px">
          Equipo Pilas Bloques<br>
          <a title="Sitio web de la iniciativa Program.AR" href="https://program.ar" style="color:${colors.link}" target="_blank">Program.AR</a><br>
          <a title="Sitio web de la Fundación Dr. Manuel Sadosky" href="http://www.fundacionsadosky.org.ar/" style="color:${colors.link}" target="_blank">Fundación Dr. Manuel Sadosky</a><br/>
          Tel.:&emsp;(+54 11)&nbsp;4891-8952<br>
          Email:&emsp;<a href="mailto:${pilasBloquesEmail}" style="color:${colors.link}" target="_blank">${pilasBloquesEmail}</a>
        </p>
      </td>
      </tr>
    </tbody>
  </table>  
`

const applyStyles = (content: string) => {
  const border = 'border: 1px solid gray; border-collapse: collapse'
  return content.
    replace(/<table>/g, `<table style="${border}">`).
    replace(/<th>/g, `<th style="${border}">`).
    replace(/<td>/g, `<td style="${border}">`)
}