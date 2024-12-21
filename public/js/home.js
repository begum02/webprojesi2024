document.addEventListener('DOMContentLoaded', () => {
  // Avatar üzerine tıklanarak menüyü açma ve kapama
  const userInitials = document.querySelector('.user-initials');
  if (userInitials) {
    userInitials.addEventListener('click', () => {
      const dropdownMenu = document.querySelector('.dropdown-content');
      // Menü görünürse, gizle; gizli ise, göster
      if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
      } else {
        console.log("Dropdown menu bulunamadı.");
      }
    });
  } else {
    console.log("User initials bulunamadı.");
  }

  // Logout butonuna tıklanarak çıkış yapma
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      // Çıkış işlemi için backend'e POST isteği gönder
      const response = await fetch('/logout', { method: 'POST' });
      if (response.ok) {
        // Çıkış başarılı, anasayfaya yönlendir
        window.location.href = '/'; // Anasayfaya yönlendirme
      } else {
        alert('Çıkış yapılırken bir hata oluştu');
      }
    });
  }
});
