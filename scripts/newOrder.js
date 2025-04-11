document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('orderTable');
    let serialNumber = 2;  // Start from the second row

    if (table) {
        const ensureMinimumRows = () => {
            const categories = ['ACB', 'MCCB', 'Others'];

            categories.forEach(category => {
                const rows = table.querySelectorAll(`tr[data-category="${category}"]`);
                if (rows.length === 0) {
                    addRow(category);
                }
            });
        };

        const addRow = (category) => {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll(`tr[data-category="${category}"]`));
            const nextIndex = rows.length + 1;
            const newRow = document.createElement('tr');
            newRow.classList.add('order-row');
            newRow.dataset.category = category;

            newRow.innerHTML = `
                <td style= 'text-align: center;'>${serialNumber++}</td>
                <td><input type="text" name="description" value="${category} ${nextIndex}"></td>
                <td><input type="text" name="current"></td>
                <td><input type="number" name="quantity" min="1"></td>
                <td><input type="text" name="orderDescription"></td>
                <td><input type="text" name="remarks"></td>
                <td style="padding: 0px 15px 0px 15px;">
                    <select name="accessories" class="accessories" style="height:35px; width: 80px;">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </td>
                <td>
                        <button type="button" class="add-row">+</button>
                        <button type="button" class="close-row"> - </button>
                </td>
            `;

            const lastRow = rows[rows.length - 1];
            if (lastRow) {
                lastRow.after(newRow);
            } else {
                tbody.appendChild(newRow);
            }
        };

        table.addEventListener('click', (e) => {
            const target = e.target;

            if (target.classList.contains('add-row')) {
                const row = target.closest('tr');
                const category = row.dataset.category;
                addRow(category);  // Add row when "Add" button is clicked
            }

            if (target.classList.contains('close-row')) {
                const row = target.closest('tr');
                row.remove();  // Remove row when "Close" button is clicked
                updateSerialNumbers();  // Update serial numbers after removing a row
            }
        });

        ensureMinimumRows();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const billOrderForm = document.getElementById('billOrderForm');

    if (billOrderForm) {
        billOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const rows = Array.from(document.querySelectorAll('#billOrderForm tbody tr')).map(row => ({
                description: row.querySelector('input[name="description"]').value,
                current: row.querySelector('input[name="current"]').value,
                quantity: row.querySelector('input[name="quantity"]').value,
                orderDescription: row.querySelector('input[name="orderDescription"]').value,
                remarks: row.querySelector('input[name="remarks"]').value,
                accessories: row.querySelector('select[name="accessories"]').value
            }));

            const payload = {
                panelNumber: document.querySelector('input[name="panelNumber"]').value,
                orderDate: document.querySelector('input[name="orderDate"]').value,
                rows
            };

            fetch('http://192.168.100.129:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (response.ok) {
                        alert('Order saved successfully!');
                        window.location.href = 'viewOrder.html';
                    } else {
                        alert('Failed to save the order.');
                    }
                })
                .catch(err => console.error(err));
        });
    }
});