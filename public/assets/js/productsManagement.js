document.addEventListener('DOMContentLoaded', function () {
    const addproductButton = document.getElementById('add-product-button');

    addproductButton.addEventListener('click', (e) => {
        console.log("hey from add");
        window.location.href = '/admin/add_products';
    });

    const deleteButtons = document.querySelectorAll('.delete-button');

    deleteButtons.forEach(button => {


        button.addEventListener('click', (e) => {
            

            
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this product!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    const productId = e.target.getAttribute('data-product-id');
                    const productVarId = e.target.getAttribute('data-productvarid');
        
                    fetch('/admin/delete_product', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId: productId, productVarId: productVarId })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data) {
                                swal({
                                    icon: 'success',
                                    text: 'Product has been deleted',
                                    button: 'OK'
                                });
                                console.log('Success:', data);
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                } else {
                    e.preventDefault();
                    return;
                }
            });

          
        });
    });

    const search = document.querySelector('.input-group1 input'),
        table_rows = document.querySelectorAll('tbody tr'),
        table_headings = document.querySelectorAll('thead th');

    // 1. Searching for specific data in the HTML table
    search.addEventListener('input', searchTable);

    function searchTable() {
        table_rows.forEach((row, i) => {
            let table_data = row.textContent.toLowerCase(),
                search_data = search.value.toLowerCase();

            row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
            row.style.setProperty('--delay', i / 25 + 's');
        });

        document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
            visible_row.style.backgroundColor = (i % 2 === 0) ? 'transparent' : '#0000000b';
        });
    }

    // 2. Sorting | Ordering data of HTML table
    table_headings.forEach((head, i) => {
        let sort_asc = true;
        head.onclick = () => {
            table_headings.forEach(head => head.classList.remove('active'));
            head.classList.add('active');

            document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
            table_rows.forEach(row => {
                row.querySelectorAll('td')[i].classList.add('active');
            });

            head.classList.toggle('asc', sort_asc);
            sort_asc = head.classList.contains('asc') ? false : true;

            sortTable(i, sort_asc);
        };
    });

    function sortTable(column, sort_asc) {
        [...table_rows].sort((a, b) => {
            let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
                second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

            return sort_asc ? (first_row > second_row ? 1 : -1) : (first_row > second_row ? -1 : 1);
        })
            .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
    }
});
