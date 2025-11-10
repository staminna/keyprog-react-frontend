/**
 * Verification Service
 * Handles dual verification system:
 * - User email verification
 * - Admin approval
 */

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const ADMIN_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

export interface VerificationResult {
  success: boolean;
  message: string;
  userActivated: boolean;
  needsAdminApproval?: boolean;
  needsEmailVerification?: boolean;
}

/**
 * Verify user email with token
 * Updates email_verified to true
 * Activates user if admin has already approved
 */
export async function verifyUserEmail(token: string): Promise<VerificationResult> {
  try {
    // Find user by email_verification_token
    const findResponse = await fetch(
      `${DIRECTUS_URL}/users?filter[email_verification_token][_eq]=${token}`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!findResponse.ok) {
      return {
        success: false,
        message: 'Token de verificação inválido ou expirado',
        userActivated: false
      };
    }

    const findData = await findResponse.json();
    const users = findData.data;

    if (!users || users.length === 0) {
      return {
        success: false,
        message: 'Token de verificação não encontrado',
        userActivated: false
      };
    }

    const user = users[0];

    // Check if already verified
    if (user.email_verified) {
      return {
        success: true,
        message: 'Email já verificado',
        userActivated: user.status === 'active',
        needsAdminApproval: !user.admin_approved
      };
    }

    // Update user: set email_verified to true
    // If admin_approved is also true, activate the user
    const shouldActivate = user.admin_approved === true;

    const updateResponse = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_verified: true,
        status: shouldActivate ? 'active' : 'draft'
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Falha ao atualizar utilizador');
    }

    return {
      success: true,
      message: shouldActivate
        ? 'Email verificado! A sua conta está agora ativa.'
        : 'Email verificado! Aguarde a aprovação do administrador.',
      userActivated: shouldActivate,
      needsAdminApproval: !shouldActivate
    };

  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      success: false,
      message: 'Erro ao verificar email. Por favor tente novamente.',
      userActivated: false
    };
  }
}

/**
 * Approve user by admin
 * Updates admin_approved to true
 * Activates user if email is already verified
 */
export async function approveUser(token: string): Promise<VerificationResult> {
  try {
    // Find user by admin_approval_token
    const findResponse = await fetch(
      `${DIRECTUS_URL}/users?filter[admin_approval_token][_eq]=${token}`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!findResponse.ok) {
      return {
        success: false,
        message: 'Token de aprovação inválido ou expirado',
        userActivated: false
      };
    }

    const findData = await findResponse.json();
    const users = findData.data;

    if (!users || users.length === 0) {
      return {
        success: false,
        message: 'Token de aprovação não encontrado',
        userActivated: false
      };
    }

    const user = users[0];

    // Check if already approved
    if (user.admin_approved) {
      return {
        success: true,
        message: 'Utilizador já aprovado',
        userActivated: user.status === 'active',
        needsEmailVerification: !user.email_verified
      };
    }

    // Update user: set admin_approved to true
    // If email_verified is also true, activate the user
    const shouldActivate = user.email_verified === true;

    const updateResponse = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        admin_approved: true,
        status: shouldActivate ? 'active' : 'draft'
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Falha ao aprovar utilizador');
    }

    return {
      success: true,
      message: shouldActivate
        ? `Utilizador aprovado e ativado! Email: ${user.email}`
        : `Utilizador aprovado. Aguarda verificação de email do utilizador.`,
      userActivated: shouldActivate,
      needsEmailVerification: !shouldActivate
    };

  } catch (error) {
    console.error('Error approving user:', error);
    return {
      success: false,
      message: 'Erro ao aprovar utilizador. Por favor tente novamente.',
      userActivated: false
    };
  }
}

/**
 * Check if user can make purchases
 * User must have:
 * - status: 'active'
 * - email_verified: true
 * - admin_approved: true
 */
export async function canUserPurchase(userId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/users/${userId}?fields=status,email_verified,admin_approved`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const user = data.data;

    return (
      user.status === 'active' &&
      user.email_verified === true &&
      user.admin_approved === true
    );
  } catch (error) {
    console.error('Error checking purchase permission:', error);
    return false;
  }
}
