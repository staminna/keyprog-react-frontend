/**
 * Email Flow Service
 * Integração com Directus Flows para envio de emails via LiquidJS templates
 */

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';

// Webhook URLs dos Flows (lidas do .env para fácil troca em produção)
const FLOWS = {
  PASSWORD_RESET: `/flows/trigger/${import.meta.env.VITE_FLOW_PASSWORD_RESET}`,
  EMAIL_VERIFICATION: `/flows/trigger/${import.meta.env.VITE_FLOW_EMAIL_VERIFICATION}`,
  USER_INVITATION: `/flows/trigger/${import.meta.env.VITE_FLOW_USER_INVITATION || ''}`,
};

// Validar se os Flow IDs estão configurados
if (!import.meta.env.VITE_FLOW_PASSWORD_RESET) {
  console.warn('⚠️ VITE_FLOW_PASSWORD_RESET não configurado no .env');
}
if (!import.meta.env.VITE_FLOW_EMAIL_VERIFICATION) {
  console.warn('⚠️ VITE_FLOW_EMAIL_VERIFICATION não configurado no .env');
}

/**
 * Envia email de redefinição de palavra-passe
 * @param email Email do utilizador
 * @param resetToken Token de reset gerado
 * @returns Promise<boolean> True se enviado com sucesso
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

  try {
    const response = await fetch(`${DIRECTUS_URL}${FLOWS.PASSWORD_RESET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        resetUrl: resetUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send password reset email:', error);
      return false;
    }

    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Envia email de verificação de conta
 * @param email Email do utilizador
 * @param verifyToken Token de verificação gerado
 * @returns Promise<boolean> True se enviado com sucesso
 */
export async function sendEmailVerification(
  email: string,
  verifyToken: string
): Promise<boolean> {
  const verifyUrl = `${window.location.origin}/verify-email?token=${verifyToken}`;

  try {
    const response = await fetch(`${DIRECTUS_URL}${FLOWS.EMAIL_VERIFICATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        verifyUrl: verifyUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email verification:', error);
      return false;
    }

    console.log('✅ Email verification sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
}

/**
 * Envia convite para novo utilizador
 * @param email Email do utilizador convidado
 * @param inviteToken Token de convite gerado
 * @returns Promise<boolean> True se enviado com sucesso
 */
export async function sendUserInvitation(
  email: string,
  inviteToken: string
): Promise<boolean> {
  const inviteUrl = `${window.location.origin}/accept-invite?token=${inviteToken}`;

  try {
    const response = await fetch(`${DIRECTUS_URL}${FLOWS.USER_INVITATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        inviteUrl: inviteUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send user invitation:', error);
      return false;
    }

    console.log('✅ User invitation sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending user invitation:', error);
    return false;
  }
}

/**
 * Testa a conexão com um Flow
 * @param flowId ID do Flow para testar
 * @returns Promise<boolean> True se o Flow está acessível
 */
export async function testFlowConnection(flowId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/flows/trigger/${flowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        resetUrl: 'http://test.com',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Flow connection test failed:', error);
    return false;
  }
}
