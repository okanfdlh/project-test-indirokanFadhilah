document.addEventListener("DOMContentLoaded", function () {
    var prevScrollpos = window.pageYOffset;

    window.addEventListener('scroll', function () {
        var currentScrollPos = window.pageYOffset;

        if (prevScrollpos > currentScrollPos) {
            // Scrolling up
            document.querySelector('.scrolling-navbar').classList.remove('hidden');
        } else {
            // Scrolling down
            document.querySelector('.scrolling-navbar').classList.add('hidden');
        }

        prevScrollpos = currentScrollPos;
    });

    var selectElement = document.getElementById('floatingSelect');
    selectElement.addEventListener('change', handleSelectChange);

    var sortBySelectElement = document.getElementById('sortBySelect');
    sortBySelectElement.addEventListener('change', handleSortByChange);
    
    window.onscroll = handleScroll;
    generateCards();

    var initialShowPerPage = getShowPerPageFromLocalStorage() || 10;
    adjustCardDisplay(initialShowPerPage);
    selectElement.value = initialShowPerPage;
    updateShowingText(initialShowPerPage);

    // Initialize the sorting value from local storage or default to 'newest'
    var initialSortValue = getSortByFromLocalStorage() || 'newest';
    sortBySelectElement.value = initialSortValue;
    sortCards(initialSortValue);

    function handleSelectChange() {
        var selectedValue = parseInt(selectElement.value);
        saveShowPerPageToLocalStorage(selectedValue);
        localStorage.setItem('selectedValue', selectedValue);
        adjustCardDisplay(selectedValue);
        updateShowingText(selectedValue);
    }

    function saveShowPerPageToLocalStorage(value) {
        localStorage.setItem('showPerPage', value);
    }

    function getShowPerPageFromLocalStorage() {
        return parseInt(localStorage.getItem('showPerPage'));
    }

    function updateShowingText(selectedValue) {
        var showingTextElement = document.querySelector('#sort-list .text');
        var upperBound = selectedValue < 100 ? selectedValue : 100;
        showingTextElement.textContent = `Showing 1 - ${upperBound} of 100`;
    }

    function adjustCardDisplay(cardsPerPage) {
        var cards = document.querySelectorAll('.card');
        cards.forEach(function (card, index) {
            card.style.display = 'none';
        });

        for (var i = 0; i < cardsPerPage && i < cards.length; i++) {
            cards[i].style.display = 'block';
        }
    }

    function handleSortByChange() {
        var selectedSortValue = sortBySelectElement.value;
        saveSortByToLocalStorage(selectedSortValue);
        sortCards(selectedSortValue);
    }

    function saveSortByToLocalStorage(value) {
        localStorage.setItem('sortBy', value);
    }

    function getSortByFromLocalStorage() {
        return localStorage.getItem('sortBy');
    }

    function sortCards(sortValue) {
        var cards = document.querySelectorAll('.card');
        var cardsArray = Array.from(cards);

        if (sortValue === 'newest') {
            cardsArray.sort(compareDatesDesc);
        } else if (sortValue === 'oldest') {
            cardsArray.sort(compareDatesAsc);
        }

        var cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = '';

        cardsArray.forEach(function (card) {
            cardContainer.appendChild(card);
        });
    }

    function compareDatesAsc(card1, card2) {
        var date1 = new Date(card1.querySelector('.card-date').textContent);
        var date2 = new Date(card2.querySelector('.card-date').textContent);
        return date1 - date2;
    }

    function compareDatesDesc(card1, card2) {
        var date1 = new Date(card1.querySelector('.card-date').textContent);
        var date2 = new Date(card2.querySelector('.card-date').textContent);
        return date2 - date1;
    }

    function handleScroll() {
        const currentScrollPos = window.pageYOffset;

        const bannerImage = document.querySelector(".banner img");
        bannerImage.style.transform = `translateY(${-currentScrollPos * 0.7}px)`;

        const bannerText = document.querySelector(".banner-text h1");
        bannerText.style.transform = `translateX(${-currentScrollPos * 0.7}px)`;

        const bannerText2 = document.querySelector(".banner-text p");
        bannerText2.style.transform = `translateX(${-currentScrollPos * 0.7}px)`;

        const header = document.querySelector("header");
        header.classList.toggle("inactive", prevScrollpos <= currentScrollPos);

        prevScrollpos = currentScrollPos;
    }

    function generateCards() {
        const cardContainer = document.getElementById('cardContainer');
        const existingCard = document.querySelector('.card');

        cardContainer.innerHTML = '';

        for (let i = 0; i < 100; i++) {
            if (i === 5) {
                continue;
            }

            const newCard = existingCard.cloneNode(true);

            newCard.querySelector('.card-text').textContent = getCardText(i);

            const imageUrl = i % 2 === 0 ?
                'img/pos1.jpeg' :
                'img/pos2.jpg';

            newCard.querySelector('.card-img-top').src = imageUrl;

            const randomDate = generateRandomDate();
            newCard.querySelector('.card-date').textContent = randomDate;

            cardContainer.appendChild(newCard);
        }
    }

    function generateRandomDate() {
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2024-08-12');

        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return randomDate.toLocaleDateString('en-US', options);
    }

    function getCardText(index) {
        return index % 2 === 0 ?
            "Jangan Asal Pilih Influencer Berikut Cara Menyusun Strategi Influencer agar hidup tenang dan nyaman" :
            "Kenali Tingkatan Influencers berdasarkan jumlah Followers";
    }
    


// URL API
const apiUrl = 'https://suitmedia-backend.suitdev.com/api/ideas';

// Parameter default
let page = 1;
let size = 10;
let sortBy = '-published_at'; // 'published_at' untuk oldest, '-published_at' untuk newest

// Elemen DOM
const cardContainer = document.getElementById('cardContainer');
const totalItemsText = document.querySelector('#sort-list .text');

// Fungsi untuk mem-fetch data dari API
async function fetchPosts() {
    try {
        const response = await fetch(`${apiUrl}?page[number]=${page}&page[size]=${size}&append[]=small_image&append[]=medium_image&sort=${sortBy}`);
        const data = await response.json();

        if (!data.data) {
            throw new Error('Data tidak ditemukan');
        }

        // Tampilkan jumlah total item
        const totalItems = data.meta.total;
        totalItemsText.textContent = `Showing ${(page - 1) * size + 1} - ${Math.min(page * size, totalItems)} of ${totalItems}`;

        // Tampilkan postingan
        renderPosts(data.data);
        updatePagination();
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Fungsi untuk merender postingan ke dalam HTML
function renderPosts(posts) {
    cardContainer.innerHTML = ''; // Bersihkan container sebelum menambahkan card baru

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.width = '18rem';

        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = post.small_image; // URL gambar kecil
        img.alt = post.title;
        img.loading = 'lazy';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardDate = document.createElement('p');
        cardDate.className = 'card-date text-danger';
        cardDate.textContent = new Date(post.published_at).toLocaleDateString(); // Format tanggal

        const cardText = document.createElement('p');
        cardText.className = 'card-text fw-bold';
        cardText.textContent = post.title; // Title post

        cardBody.appendChild(cardDate);
        cardBody.appendChild(cardText);
        card.appendChild(img);
        card.appendChild(cardBody);
        cardContainer.appendChild(card);
    });
}

// Fungsi untuk meng-update pagination (opsional, jika ada)
function updatePagination() {
    // Logika untuk memperbarui pagination sesuai dengan total halaman
    // Misal: menambahkan class 'active' pada halaman saat ini, atau disable tombol jika di halaman pertama/terakhir
}

// Event listener untuk sorting dan paginating
document.getElementById('floatingSelect').addEventListener('change', (event) => {
    size = event.target.value;
    fetchPosts();
});

document.getElementById('sortBySelect').addEventListener('change', (event) => {
    sortBy = event.target.value === 'newest' ? '-published_at' : 'published_at';
    fetchPosts();
});

// Panggil fetchPosts pertama kali saat halaman dimuat
fetchPosts();

});



