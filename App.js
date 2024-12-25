const express = require("express");
const path = require("path");
const mustacheExpress = require("mustache-express");
const session = require("express-session");
const { registerUser, loginUser,logoutUser } = require("./controllers/authController");
const cors = require("cors"); // CORS modülünü dahil ediyoruz
const {getTopBooks}=require('./controllers/Lists')
const{getCategories, getBooksByCategory }=require("./controllers/categories")
const { fetchBooks ,getEbookDetails, getFavoriteBooks } = require('./controllers/ebookController');
const { getAudioBooks, getAudiobookDetails, getFavoriteAudiobooks, toggleAudiobookFavorite } = require('./controllers/audiobookController');
const{getAudiobooks}=require('./controllers/getAudiobooks')
const{fetchAuthors}=require('./controllers/fetchAuthors')
const { postEbookRating, getEbookRatings,getAudiobookRatings,postAudiobookRating } = require('./controllers/ratingController'); // Rating işlemleri
const { 
    getReadingHistory, 
    addReadingHistory, 
    getListeningHistory, 
    addListeningHistory 
} = require('./controllers/historyController');
const supabase = require('./SupabaseClient');

const  app  = express();
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL'sini buraya ekleyin
  credentials: true, // Çerezlerin gönderilmesine izin verir
}));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// View engine setup (Mustache)
app.engine('mustache', mustacheExpress(path.join(__dirname, 'views/partials')));
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// Session setup
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true, // Veri eklenmeden session kaydedilmesin
    cookie: { 
      secure: false, // Eğer HTTPS kullanmıyorsanız bunu false yapın
      maxAge: 1000 * 60 * 60 * 24, // Çerezin geçerlilik süresi (1 gün)
      httpOnly: true // Çerezi sadece HTTP üzerinden erişilebilir yapar
    }
  })
);

app.use(express.urlencoded({ extended: true })); // Form verilerini işlemek için

// Add middleware to store original URL
app.use((req, res, next) => {
    if (!req.session.is_logged_in && req.path !== '/login') {
        req.session.returnTo = req.originalUrl;
    }
    next();
});

// Giriş Sayfası
app.get("/login", (req, res) => {
  res.render("login", { title: "Giriş Yap" });
});

// Kullanıcı Girişi
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    req.session.user = user;
    req.session.is_logged_in = true;

    // Get stored URL and clear it
    const returnUrl = req.session.returnTo || '/home';
    delete req.session.returnTo;

    res.redirect(returnUrl);
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
    res.redirect("/home");
  }
});


// Logout İşlemi
app.post("/logout", (req, res) => {
  logoutUser(req, res); // logoutUser fonksiyonunu çağır
});


const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.is_logged_in) {
      return next();
  } else {
      return res.status(401).json({ error: 'Unauthorized' });
  }
};



app.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    const categoryBooks = [];

    // Get categories and books
    for (let category of categories) {
      const books = await getBooksByCategory(category.id);
      categoryBooks.push({ category, books });
    }

    // Add user session data
    res.render('categories', { 
      categoryBooks,
      is_logged_in: req.session.is_logged_in || false,
      user_first_initial: req.session.user ? req.session.user.username.charAt(0).toUpperCase() : '',
      user: req.session.user || null,
      isCategories: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// fetchBooks fonksiyonunun tanımlı olduğu dosyayı dahil edin


// Kitapları getiren rota
app.get('/ebooks', async (req, res) => {
  try {
    const books = await fetchBooks();
    const isLoggedIn = req.session.is_logged_in || false;
    const userFirstInitial = req.session.user ? 
      req.session.user.username.charAt(0).toUpperCase() : '';

    res.render('ebooks', { 
      books,
      is_logged_in: isLoggedIn,
      user_first_initial: userFirstInitial,
      user: req.session.user || null,
      isEbooks: true
    });

  } catch (err) {
    console.error('Error fetching books:', err.message);
    res.status(500).send('An error occurred while fetching books');
  }
});



app.get('/audio_book_detail/:id', async (req, res) => {
  const audiobookId = parseInt(req.params.id);

  try {
    const audiobookDetails = await getAudiobookDetails(audiobookId);
    const ratingsData = await getAudiobookRatings({ 
      params: { bookId: audiobookId }
    }, { 
      json: (data) => data 
    });

    // Add this to handle history tracking
    if (req.session.user) {
      await addListeningHistory({
        body: {
          user_id: req.session.user.id,
          book_id: audiobookId
        }
      }, {
        status: () => ({ json: () => {} })
      });
    }

    if (audiobookDetails) {
      res.render('audio_book_detail', { 
        book: audiobookDetails,
        ratings: ratingsData.ratings || [],
        averageRating: ratingsData.averageRating || 0,
        is_logged_in: req.session.is_logged_in || false,
        user_first_initial: req.session?.user?.username?.charAt(0).toUpperCase() || '',
        user: req.session.user || null
      });
    } else {
      res.status(404).json({ error: 'Audiobook not found' });
    }
  } catch (error) {
    console.error('Error fetching audiobook details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.get('/audio_book_list', async (req, res) => {
  try {
    const audiobooks = await getAudiobooks();

    if (audiobooks && audiobooks.length > 0) {
      res.render('audio_book_list', { 
        books: audiobooks,
        is_logged_in: req.session.is_logged_in || false,
        user_first_initial: req.session.user ? req.session.user.username.charAt(0).toUpperCase() : '',
        user: req.session.user || null,
        isAudioBooks: true
      });
    } else {
      res.render('audio_book_list', { 
        books: [],
        is_logged_in: req.session.is_logged_in || false,
        user_first_initial: req.session.user ? req.session.user.email.charAt(0).toUpperCase() : '',
        user: req.session.user || null
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/audiobooks', async (req, res) => {
  try {
      const audiobooks = await getAudioBooks();
      res.render('audio_book_list', {
          books: audiobooks
      });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: err.message });
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

app.get('/ebook/:id', async (req, res) => {
    const ebookId = req.params.id;
    
    try {
        const ebookDetails = await getEbookDetails(ebookId);
        const ratingsData = await getEbookRatings({ 
            params: { bookId: ebookId } 
        }, { 
            json: (data) => data 
        });

        res.render('book_detail', {
            id: ebookId,
            title: ebookDetails.title,
            author: ebookDetails.author,
            published_date: ebookDetails.published_date,
            cover_image: ebookDetails.cover_image,
            description: ebookDetails.description,
            ratings: ratingsData.ratings || [],
            averageRating: ratingsData.averageRating || 0,
            user: req.session.user,
            isLoggedIn: req.session.is_logged_in || false
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rating işlemleri
app.post('/api/ebook/ratings', isLoggedIn, postEbookRating);
app.get('/api/ebook/ratings/:bookId', getEbookRatings);
app.get('/api/audiobook/:id', getAudiobookRatings);
app.post('/api/audiobook/ratings', isLoggedIn, postAudiobookRating);

// Replace or update existing history routes
app.get('/api/history', isLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Get both reading and listening history
        const read_books = await getReadingHistory({ 
            params: { user_id: userId }
        });
        
        const listened_books = await getListeningHistory({ 
            params: { user_id: userId }
        });

        res.json({
            read_books: read_books || [],
            listened_books: listened_books || []
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update existing history routes
app.get('/history', isLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const read_books = await getReadingHistory(userId);
        const listened_books = await getListeningHistory(userId);

        res.render('history', {
            is_logged_in: true,
            user_first_initial: req.session.user.username.charAt(0).toUpperCase(),
            user: req.session.user,
            read_books: read_books || [],
            listened_books: listened_books || [],
            currentPage: 'history'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            message: 'Geçmiş yüklenirken bir hata oluştu.' 
        });
    }
});

// Add middleware for history routes
app.post('/api/history/reading', isLoggedIn, addReadingHistory);
app.post('/api/history/listening', isLoggedIn, addListeningHistory);

// Add new route for favorites
app.get('/favorites', isLoggedIn, async (req, res) => {
    try {
        const favoriteBooks = await getFavoriteBooks();
        const favoriteAudiobooks = await getFavoriteAudiobooks();
        
        res.render('favorites', {
            is_logged_in: true,
            user_first_initial: req.session.user.username.charAt(0).toUpperCase(),
            user: req.session.user,
            favorite_books: favoriteBooks || [],
            favorite_audiobooks: favoriteAudiobooks || [],
            currentPage: 'favorites'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            message: 'Favoriler yüklenirken bir hata oluştu.' 
        });
    }
});

// Add this route
app.post('/api/favorites/toggle', isLoggedIn, async (req, res) => {
    try {
        const { book_id } = req.body;
        const result = await toggleAudiobookFavorite(book_id);
        res.json({ success: true, isFavorite: result.isFavorite });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sunucuyu başlatıyoruz
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

app.get('/', (req, res) => {
    res.render('home', {
        is_logged_in: req.session.is_logged_in || false,
        user_first_initial: req.session?.user?.username?.charAt(0).toUpperCase() || '',
        currentPage: 'home'
    });
});

app.get('/audio_book_list', async (req, res) => {
    try {
        const audiobooks = await getAudiobooks();
        res.render('audio_book_list', {
            books: audiobooks,
            is_logged_in: req.session.is_logged_in || false,
            user_first_initial: req.session?.user?.username?.charAt(0).toUpperCase() || '',
            currentPage: 'audio_book_list'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/ebooks', async (req, res) => {
    try {
        const books = await fetchBooks();
        res.render('ebooks', {
            books,
            is_logged_in: req.session.is_logged_in || false,
            user_first_initial: req.session?.user?.username?.charAt(0).toUpperCase() || '',
            currentPage: 'ebooks'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await getCategories();
        res.render('categories', {
            categories,
            is_logged_in: req.session.is_logged_in || false,
            user_first_initial: req.session?.user?.username?.charAt(0).toUpperCase() || '',
            currentPage: 'categories'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
