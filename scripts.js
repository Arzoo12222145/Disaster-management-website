async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        document.getElementById('data').innerHTML = JSON.stringify(data, null, 2);
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    fetchData();
});
