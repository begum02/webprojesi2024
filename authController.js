const supabase = require('./SupabaseClient'); // Supabase istemcisi
const bcrypt = require('bcryptjs');

// Şifreyi hash'leme fonksiyonu
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Şifreyi doğrulama fonksiyonu
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Kullanıcı kaydı
const registerUser = async (email, password,username) => {
  const hashedPassword = await hashPassword(password);
  
  const { data, error } = await supabase
    .from('auth_user')
    .insert([{ email, password_hash: hashedPassword, username }]);

  if (error) {
    throw new Error('Kullanıcı kaydedilemedi: ' + error.message);
  }
  return data;
};



const loginUser = async (email, password) => {
  const { data, error } = await supabase
    .from('auth_user')
    .select('*')
    .eq('email', email)
    .single(); // Email ile kullanıcıyı bulma işlemi

  if (error || !data) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Şifre doğrulaması
  const isPasswordValid = await verifyPassword(password, data.password_hash);
  if (!isPasswordValid) {
    throw new Error('Geçersiz şifre');
  }

  return data; // Kullanıcı bilgilerini döndür
};



const logoutUser = (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session temizlenemedi:", err); // Hata detaylarını logla
        return res.status(500).send("Çıkış işlemi başarısız oldu");
      }
      // Çıkış sonrası home sayfasına yönlendir
      return res.redirect("/login"); // veya home sayfası
    });
  } else {
    return res.status(400).send("Oturum açmamış kullanıcı çıkışı yapamaz");
  }
};


module.exports = {
  loginUser,registerUser,logoutUser
};
