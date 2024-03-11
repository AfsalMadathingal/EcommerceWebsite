const searchInput = document.getElementById('searchProduct')

searchInput.addEventListener('keydown', (e) => {
    const value = e.target.value
    if (e.key === 'Enter')
    {
        window.location.href = `/products/all-product-search?search=${value}`
        
    }
       

    
})