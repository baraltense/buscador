let itemsData = [];

// Obtener los datos de los ítems de la API de mapeo
async function fetchItemsData() {
    try {
        const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping');
        itemsData = await response.json();
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función de búsqueda con sugerencias
function searchItems() {
    const query = document.getElementById('itemName').value.toLowerCase();
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = ''; // Limpiar las sugerencias previas

    if (!query) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    // Filtrar ítems que contienen el término de búsqueda
    const suggestions = itemsData.filter(item => item.name.toLowerCase().includes(query));

    if (suggestions.length > 0) {
        suggestions.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.innerHTML = `<span>${item.name}</span>`;
            suggestionItem.onclick = () => displayItemInfo(item);
            suggestionsDiv.appendChild(suggestionItem);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// Consultar precios de la API de precios por ID
async function getItemPrices(itemId) {
    try {
        const response = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${itemId}`);
        const data = await response.json();
        const prices = data.data[itemId];

        return prices ? {
            low: prices.low,
            high: prices.high
        } : { low: 'No disponible', high: 'No disponible' };
    } catch (error) {
        console.error('Error al obtener los precios:', error);
        return { low: 'No disponible', high: 'No disponible' };
    }
}

// Formatear el precio para mostrar con puntos
function formatPrice(price) {
    if (price === 'No disponible') return price;
    return parseInt(price).toLocaleString('es-ES');  // Formato numérico con puntos como separadores de miles
}

// Mostrar la información del ítem seleccionado
async function displayItemInfo(item) {
    const prices = await getItemPrices(item.id);
    const formattedName = item.name.replace(/\s+/g, '_').toLowerCase();
    const imageUrl = `https://oldschool.runescape.wiki/images/${capitalizeFirstLetter(formattedName)}_detail.png`;

    document.getElementById('itemNameResult').innerText = `Nombre: ${item.name}`;
    document.getElementById('itemIdResult').innerText = `ID: ${item.id}`;
    document.getElementById('itemValueResult').innerText = `Valor: Low: ${formatPrice(prices.low)} GP, High: ${formatPrice(prices.high)} GP`;
    document.getElementById('itemExamineResult').innerText = `Examine: ${item.examine}`;
    document.getElementById('itemLimitResult').innerText = `Límite de compra: ${item.limit}`;

    // Intentamos cargar la imagen
    const img = new Image();
    img.src = imageUrl;

    img.onload = function() {
        document.getElementById('itemImage').src = imageUrl;
        document.getElementById('errorMessage').style.display = 'none';
    };

    img.onerror = function() {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('itemImage').src = ''; // Limpiamos la imagen
    };

    document.getElementById('result').style.display = 'block';
    document.getElementById('suggestions').style.display = 'none'; // Ocultar sugerencias
}

// Limpiar el resultado cuando no se encuentra el ítem
function resetResult() {
    document.getElementById('result').style.display = 'none';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Inicializar la carga de los datos
fetchItemsData();
