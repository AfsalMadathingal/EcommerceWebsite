document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.input-group1 input');
    const tableRows = document.querySelectorAll('.table__body1 tbody tr');

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();

        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let rowMatchesSearch = false;

            // Search through each cell in the row
            cells.forEach(cell => {
                const text = cell.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    rowMatchesSearch = true;
                }
            });

            // Show/hide row based on search match
            if (rowMatchesSearch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Clear search when 'x' is clicked (for browsers that support it)
    searchInput.addEventListener('search', function(e) {
        if (this.value === '') {
            tableRows.forEach(row => {
                row.style.display = '';
            });
        }
    });
});

// Optional: Add column sorting functionality
document.addEventListener('DOMContentLoaded', function() {
    const table = document.querySelector('.table__body1 table');
    const headers = table.querySelectorAll('th');
    
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            const direction = header.classList.contains('sort-asc') ? 'desc' : 'asc';
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            header.classList.add(`sort-${direction}`);
            
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            // Sort rows
            rows.sort((a, b) => {
                const aValue = a.children[index].textContent.trim();
                const bValue = b.children[index].textContent.trim();
                
                // Check if the values are numbers
                const aNum = parseFloat(aValue);
                const bNum = parseFloat(bValue);
                
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                return direction === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            });
            
            // Remove existing rows
            rows.forEach(row => tbody.removeChild(row));
            // Add sorted rows
            rows.forEach(row => tbody.appendChild(row));
        });
    });
});