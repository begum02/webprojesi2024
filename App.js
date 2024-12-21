const express = require("express");
const path = require("path");
const mustacheExpress = require("mustache-express");
const session = require("express-session");
const { registerUser, loginUser,logoutUser } = require("./authController");
const cors = require("cors"); // CORS modülünü dahil ediyoruz
const {getTopBooks}=require('./Lists')
const{getCategories, getBooksByCategory }=require("./categories")
const { fetchBooks } = require('./fetchEbooks');
const { getAudiobookDetails } = require('./getAudiobookDetails');
const{getAudiobooks}=require('./getAudiobooks')
const{fetchAuthors}=require('./fetchAuthors')

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL'sini buraya ekleyin
  credentials: true, // Çerezlerin gönderilmesine izin verir
}));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// View engine setup (Mustache)
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// Session setup
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false, // Veri eklenmeden session kaydedilmesin
    cookie: { 
      secure: false, // Eğer HTTPS kullanmıyorsanız bunu false yapın
      maxAge: 1000 * 60 * 60 * 24, // Çerezin geçerlilik süresi (1 gün)
      httpOnly: true // Çerezi sadece HTTP üzerinden erişilebilir yapar
    }
  })
);


// Giriş Sayfası
app.get("/login", (req, res) => {
  res.render("login", { title: "Giriş Yap" });
});

// Kullanıcı Girişi
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password); // authController'daki loginUser fonksiyonunu çağırıyoruz
    req.session.user = user; // Kullanıcıyı session'a ekliyoruz
    console.log(req.session.user); // Oturumdaki kullanıcıyı kontrol et
    res.redirect("/home");
  } catch (error) {
    res.render("login", { title: "Giriş Yap", errorMessages: [error.message] });
  }
});

// Kayıt Sayfası
app.get("/register", (req, res) => {
  res.render("register", { title: "Kayıt Ol" });
});

// Kullanıcı Kaydı
app.post("/register", async (req, res) => {
  try {
    const { email, password,username } = req.body;
    const user = await registerUser(email, password,username); // Kullanıcıyı kaydetme işlemi
    req.session.user = user; // Kullanıcıyı session'a ekliyoruz
    res.redirect("/home"); // Kayıt işlemi sonrası home sayfasına yönlendiriyoruz
  } catch (error) {
    res.render("register", { title: "Kayıt Ol", errorMessages: [error.message] });
  }
});

// Home Rotası

app.get("/home", async (req, res) => {
  try {
    const isLoggedIn = req.session.user ? true : false;
    const userFirstInitial = isLoggedIn && req.session.user.username
      ? req.session.user.username.trim().split(" ")[0][0].toUpperCase()
      : null;

    const popularBooks = await getTopBooks();

    res.render("home", {
      is_logged_in: isLoggedIn,
      user_first_initial: userFirstInitial,
      popular_books: popularBooks, // Popüler kitaplar
    });
  } catch (err) {
    console.error("Error rendering home page:", err.message);
    res.status(500).send("An error occurred.");
  }
});




// Ana Sayfa Yönlendirme
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});


// Logout İşlemi
app.post("/logout", (req, res) => {
  logoutUser(req, res); // logoutUser fonksiyonunu çağır
});


app.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    const categoryBooks = [];

    // Her kategori için kitapları alalım
    for (let category of categories) {
      const books = await getBooksByCategory(category.id);
      categoryBooks.push({ category, books });
    }

    // Dinamik olarak şablonu render et
    res.render('categories', { categoryBooks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// fetchBooks fonksiyonunun tanımlı olduğu dosyayı dahil edin


// Kitapları getiren rota
app.get('/ebooks', async (req, res) => {
  try {
    const books = await fetchBooks(); // fetchBooks fonksiyonunu çağır
    console.log(books); // Gönderilen veriyi konsola yazdırın
    res.render('ebooks', { books }); // ebooks.mustache dosyasına veriyi gönder
  } catch (err) {
    console.error('Error fetching books:', err.message);
    res.status(500).send('An error occurred while fetching books');
  }
});



app.get('/audio_book_detail/:id', async (req, res) => {
  const audiobookId = parseInt(req.params.id); // URL parametresinden id'yi alıyoruz

  try {
    const audiobookDetails = await getAudiobookDetails(audiobookId);

    if (audiobookDetails) {
      // Kitap bulunduysa render işlemi yapılır
      res.render('audio_book_detail', { book: audiobookDetails });
    } else {
      // Kitap bulunamadıysa 404 hata döndürülür
      res.status(404).json({ error: 'Audiobook not found' });
    }
  } catch (error) {
    // Hata durumunda 500 hata kodu döndürülür
    console.error('Error fetching audiobook details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.get('/audio_book_list', async (req, res) => {
  try {
    const audiobooks = await getAudiobooks();

    if (audiobooks && audiobooks.length > 0) {
      // Kitaplar bulunduysa render işlemi yapılır
      res.render('audio_book_list', { books: audiobooks });
    } else {
      // Kitap bulunamadıysa 404 hata döndürülür
      res.status(404).json({ error: 'No audiobooks found' });
    }
  } catch (error) {
    // Hata durumunda 500 hata kodu döndürülür
    console.error('Error fetching audiobooks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/authors', async (req, res) => {
  try {
    // Yazar verilerini al
    const authors = await fetchAuthors();

    // Eğer yazar verileri varsa render veya JSON döndür
    if (authors) {
      res.render('authors', { authors }); // Yazar bilgilerini views/authors.ejs dosyasına gönder
    } else {
      res.status(404).send('Hiç yazar bulunamadı.');
    }
  } catch (error) {
    console.error('Hata oluştu:', error.message);
    res.status(500).send('Sunucu hatası.');
  }
});





// Sunucuyu başlatıyoruz
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
