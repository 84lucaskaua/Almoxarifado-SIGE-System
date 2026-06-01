/**
 * Utilitário para remover a foto de perfil do administrador
 * Agora o admin mostrará apenas a letra "A" em uma bolinha azul
 */

export function removeAdminPhoto(): void {
  try {
    // 1. Atualizar na lista de usuários
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      const adminIndex = users.findIndex((u: any) => u.email === 'admin@sige.com');

      if (adminIndex !== -1) {
        // Remove a propriedade profileImage
        delete users[adminIndex].profileImage;
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✓ Foto removida da lista de usuários');
      }
    }

    // 2. Atualizar o usuário atual se for o admin
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.email === 'admin@sige.com') {
        delete currentUser.profileImage;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('✓ Foto removida do usuário atual');
      }
    }

    console.log('✅ Perfil do administrador atualizado!');
    console.log('📌 Agora exibindo apenas a letra "A" em bolinha azul');
    console.log('🔄 Recarregando a página...');

    // Recarregar a página após 500ms
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
  }
}

// Disponibilizar globalmente para fácil acesso no console
if (typeof window !== 'undefined') {
  (window as any).removeAdminPhoto = removeAdminPhoto;
}

// Executar automaticamente ao carregar o módulo (apenas uma vez)
if (typeof window !== 'undefined' && !sessionStorage.getItem('adminPhotoRemoved')) {
  // Marcar como executado nesta sessão
  sessionStorage.setItem('adminPhotoRemoved', 'true');

  // Executar após um pequeno delay para garantir que o DOM está pronto
  setTimeout(() => {
    removeAdminPhoto();
  }, 100);
}
