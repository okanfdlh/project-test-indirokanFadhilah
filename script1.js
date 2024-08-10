export default {
    server: {
      proxy: {
        '/api': {
          target: 'https://suitmedia-backend.suitdev.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
  document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch data from the API
    async function fetchIdeas(pageNumber = 1, pageSize = 10, sort = '-published_at') {
        const url = `/api/ideas?page[number]=${pageNumber}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sort}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data); // Handle the data here
            displayIdeas(data);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    // Function to display the ideas on the page
    function displayIdeas(ideasData) {
        const cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = ''; // Clear the container first

        ideasData.data.forEach(idea => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.width = '18rem';

            const img = document.createElement('img');
            img.src = idea.small_image; // Use the small_image from the API
            img.className = 'card-img-top';
            img.alt = idea.title;
            img.loading = 'lazy';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const cardDate = document.createElement('p');
            cardDate.className = 'card-date text-danger';
            cardDate.textContent = new Date(idea.published_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });

            const cardText = document.createElement('p');
            cardText.className = 'card-text fw-bold';
            cardText.textContent = idea.title; // Example title usage

            cardBody.appendChild(cardDate);
            cardBody.appendChild(cardText);
            card.appendChild(img);
            card.appendChild(cardBody);
            cardContainer.appendChild(card);
        });
    }

    // Initial fetch on page load
    fetchIdeas();
});
  