document.addEventListener('DOMContentLoaded', () => {
    const editDetails = document.getElementById('editDetails');

    if (editDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const panelNumber = urlParams.get('panelNumber');
        const intdate = urlParams.get('date');

        if (panelNumber != null) {
            // Convert MM-DD-YYYY to YYYY-MM-DD format
            const [day, month, year] = intdate.split('-');
            const date = `${year}-${month}-${day}`;

            fetch(`http://192.168.100.129:5000/api/orders/details/${panelNumber}`)
                .then(response => response.json())
                .then(orders => {
                    const editDetailsContainer = document.getElementById('editDetails');

                    // Create the form structure
                    const form = document.createElement('form');
                    form.id = "editOrderForm";
                    form.innerHTML = `
                        <div class="form-inline">
                            <label for="panelNumber">Panel_Number:</label>
                            <input type="text" class="panelNumber" name="panelNumber" required style="width: 56%;" value="${panelNumber}">
                            <label for="orderDate" style="padding-left: 700px;">Date:</label>
                            <input type="date" class="orderDate" name="orderDate" required style="width: 56%;" value="${date}">
                        </div>
                        <table id="editTable">
                            <thead>
                                <tr>
                                    <th>Sl no.</th>
                                    <th>Description</th>
                                    <th style="width: 10%;">Current</th>
                                    <th style="width: 5%;">Quantity</th>
                                    <th>Order Description</th>
                                    <th>Remarks</th>
                                    <th style="width: 10%;">Accessories</th>
                                    <th style="width: 5%;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                            <div class="horizontal-center">
                                <button type="button" id="finishButton" class="finish-button">Finish</button>
                            </div>
                                `;

                    const tableBody = form.querySelector('tbody');

                    // Function to get the next index for a category
                    const getNextIndex = (category) => {
                        const rows = Array.from(tableBody.querySelectorAll('tr'));
                        let maxIndex = 0;

                        rows.forEach(row => {
                            const descriptionInput = row.querySelector('input[name="description"]');
                            const description = descriptionInput ? descriptionInput.value : '';
                            const match = description.match(new RegExp(`^${category}\\s*(\\d+)$`));
                            if (match) {
                                const index = parseInt(match[1]);
                                if (index > maxIndex) maxIndex = index;
                            }
                        });

                        return maxIndex + 1;
                    };

                    // Function to add a new row based on category
                    const addRow = (rowData = {}, referenceRow = null) => {
                        const description = rowData.description || '';
                        const categoryMatch = description.match(/^(ACB|MCCB|Others)/);
                        let newCategory = '';
                        let newIndex = '';

                        if (categoryMatch) {
                            newCategory = categoryMatch[1];
                            newIndex = getNextIndex(newCategory);
                        }

                        const newRow = document.createElement('tr');
                        newRow.innerHTML = `
                            <td><input type="number" name="slno" value="${rowData.slno || ''}"></td>
                            <td><input type="text" name="description" value="${newCategory || rowData.description || ''} ${newIndex}"></td>
                            <td><input type="number" name="current" value="${rowData.current || ''}"></td>
                            <td><input type="number" name="quantity" value="${rowData.quantity || ''}"></td>
                            <td><input type="text" name="orderDescription" value="${rowData.orderDescription || ''}"></td>
                            <td><input type="text" name="remarks" value="${rowData.remarks || ''}"></td>
                            <td><input type="text" name="accessories" value="${rowData.accessories || ''}"></td>
                            <td>
                                <button type="button" class="add-row">+</button>
                                <button type="button" class="close-row">-</button>
                            </td>
                        `;

                        if (referenceRow) {
                            referenceRow.after(newRow); // Insert after the current row
                        } else {
                            tableBody.appendChild(newRow); // Append to the end of the table
                        }
                    };

                    // Add initial rows from orders data without modifying them
                    orders.forEach(order => {
                        const newRow = document.createElement('tr');
                        newRow.innerHTML = `
                            <td><input type="number" name="slno" value="${order.slno || ''}"></td>
                            <td><input type="text" name="description" value="${order.description || ''}"></td>
                            <td><input type="number" name="current" value="${order.current || ''}"></td>
                            <td><input type="number" name="quantity" value="${order.quantity || ''}"></td>
                            <td><input type="text" name="orderDescription" value="${order.orderDescription || ''}"></td>
                            <td><input type="text" name="remarks" value="${order.remarks || ''}"></td>
                            <td><input type="text" name="accessories" value="${order.accessories || ''}"></td>
                            <td>
                                <button type="button" class="add-row">+</button>
                                <button type="button" class="close-row">-</button>
                            </td>
                        `;
                        tableBody.appendChild(newRow);
                    });

                    // Event listener for add and close buttons
                    form.addEventListener('click', (e) => {
                        const target = e.target;

                        if (target.classList.contains('add-row')) {
                            const currentRow = target.closest('tr');
                            const descriptionInput = currentRow.querySelector('input[name="description"]');
                            const description = descriptionInput ? descriptionInput.value : '';
                            addRow({ description }, currentRow); // Add a new row below the current row
                        }

                        if (target.classList.contains('close-row')) {
                            const row = target.closest('tr');
                            row.remove(); // Remove the current row
                        }
                    });

                    // Function to gather data from the table
                    const getTableData = () => {
                        const rows = tableBody.querySelectorAll('tr');
                        const data = Array.from(rows).map(row => ({
                            slno: row.querySelector('input[name="slno"]').value,
                            description: row.querySelector('input[name="description"]').value,
                            current: row.querySelector('input[name="current"]').value,
                            quantity: row.querySelector('input[name="quantity"]').value,
                            orderDescription: row.querySelector('input[name="orderDescription"]').value,
                            remarks: row.querySelector('input[name="remarks"]').value,
                            accessories: row.querySelector('input[name="accessories"]').value,
                        }));
                        return data;
                    };

                    // Event listener for the Finish button
                    form.querySelector('#finishButton').addEventListener('click', () => {
                        const tableData = getTableData();
                        const payload = {
                            panelNumber: form.querySelector('input[name="panelNumber"]').value,
                            orderDate: form.querySelector('input[name="orderDate"]').value,
                            rows: tableData,  // Pass the updated rows here
                        };

                        // First, DELETE the existing order (panelNumber)
                        fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                            method: 'DELETE',
                        })
                            .then(response => response.text())
                            .then(message => {
                                console.log(message);  // Log successful delete message

                                // After deletion, POST the new order and details
                                return fetch(`http://192.168.100.129:5000/api/orders`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(payload), // Send updated data
                                });
                            })
                            .then(response => {
                                if (response.ok) {
                                    alert('Details updated successfully!');
                                    window.location.href = 'viewOrder.html';
                                } else {
                                    alert('Failed to update details.');
                                }
                            })
                            .catch(err => console.error(err));
                    });

                    // Append the form to the container
                    editDetailsContainer.appendChild(form);
                })
                .catch(err => console.error(err));
        }
    }
});