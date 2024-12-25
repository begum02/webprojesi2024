document.addEventListener('DOMContentLoaded', () => {
    const detailsBtns = document.querySelectorAll('.details-btn');

    detailsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const bookId = btn.closest('.book-card').dataset.id;
            if (bookId) {
                window.location.href = `/ebook/${bookId}`;
            }
        });
    });
});

