document.addEventListener('DOMContentLoaded', () => {
    const checkDetails = document.getElementById('checkDetails');

    if (checkDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const panelNumber = urlParams.get('panelNumber');
        const date = urlParams.get('date');
        if (panelNumber != null) {
            fetch(`http://192.168.100.129:5000/api/approvedorders/details/${panelNumber}`)
                .then(response => response.json())
                .then(orders => {
                    const checkDetailsContainer = document.getElementById('checkDetails');

                    // Create the table structure once
                    const p = document.createElement('p');
                    p.innerHTML = `
                        <h4 style="position: relative; left: 105px;">Panel Number: ${panelNumber}</h4>
                        <h4 style="position:absolute; top: 113px; right: 145px;">Date: ${date}</h4>
                        <button type="button" id="printButton" class="print-button">Print</button>
                        <button type="button" id="downloadButton" class="download-button">download</button>
                    `;

                    const table = document.createElement('table');
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Sl no.</th>
                                <th>Description</th>
                                <th>Current</th>
                                <th>Quantity</th>
                                <th>Order Description</th>
                                <th>Remarks</th>
                                <th>Accessories</th>
                                <th style='width: 5%'>Check</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                        <br>
                        <div class="horizontal-center">
                            <button type="button" id="checkButton" class="check-button">Check</button>
                            <button type="button" id="missingButton" class="missing-button">Missing items</button>
                        </div>                    
                    `;

                    // Get the `<tbody>` to append rows
                    const tableBody = table.querySelector('tbody');

                    // Iterate through the orders and add rows
                    orders.forEach(detail => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${detail.slno}</td>
                            <td>${detail.description}</td>
                            <td>${detail.current}</td>
                            <td>${detail.quantity}</td>
                            <td>${detail.orderDescription}</td>
                            <td>${detail.remarks}</td>
                            <td>${detail.accessories}</td>
                            <td><input type="checkbox" class="row-checkbox"></td>
                        `;
                        tableBody.appendChild(row);
                    });

                    // Append the table to the container
                    checkDetailsContainer.appendChild(p);
                    checkDetailsContainer.appendChild(table);

                    //checkOrder button function
                    table.querySelector('#checkButton').addEventListener('click', () => {
                        const checkboxes = document.querySelectorAll('.row-checkbox');
                        const checkedRows = [];
                        checkboxes.forEach((checkbox, index) => {
                            if (checkbox.checked) {
                                checkedRows.push(orders[index]); // Add the corresponding row data
                            }
                        });

                        // console.log('Checked rows:', checkedRows);

                        fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ managerStatus: 'Approved', storeStatus: 'Issued', checkStatus: 'checked' })
                        })
                            .then(updateResponse => {
                                if (updateResponse.ok) {
                                    alert('Order checked successfully and status updated!');
                                    window.location.href = 'checkView.html';  // Redirect to view order page
                                } else {
                                    alert('Failed to update status.');
                                }
                            })
                            .catch(err => {
                                console.error('Error updating status:', err);
                                alert('Failed to update status.');
                            });
                    });

                    //missingOrder button function
                    table.querySelector('#missingButton').addEventListener('click', () => {
                        const checkReason = prompt("Check the items that are missing! and Please provide reason if any:");

                        // Collect the checked items
                        const checkedItems = [];
                        const rows = table.querySelectorAll('tbody tr');
                        rows.forEach((row, index) => {
                            const checkbox = row.querySelector('.row-checkbox');
                            if (checkbox && checkbox.checked) {
                                const description = row.cells[1].textContent; // Get the description of the item
                                checkedItems.push(`${index + 1}: (${description})`);
                            }
                        });

                        if (checkReason || checkedItems.length > 0) {

                            // Append the checked items to the checkReason
                            const finalReason = checkedItems.length > 0
                                ? `${checkReason} - Missing items: ${checkedItems.join(', ')}`
                                : checkReason;

                            fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ managerStatus: 'Approved', storeStatus: 'Issued', checkStatus: 'missing items', checkReason: finalReason})
                            })
                                .then(updateResponse => {
                                    if (updateResponse.ok) {
                                        alert('Missing items informed successfully and status updated!');
                                        window.location.href = 'checkView.html';
                                    } else {
                                        alert('Failed to update status.');
                                    }
                                })
                                .catch(err => {
                                    console.error('Error updating status:', err);
                                    alert('Failed to update status.');
                                });
                        } else {
                            alert('Reason OR check items that are Missing!');
                        }
                    });

                    // Add event listener to the "download" button
                    p.querySelector('#downloadButton').addEventListener('click', () => {
                        const table = document.getElementById('checkDetails');
                        const wb = XLSX.utils.table_to_book(table, { sheet: 'Orders' });
                        XLSX.writeFile(wb, `Orders_${panelNumber}.xlsx`);
                    });

                // Add event listener to the "Print" button
                p.querySelector('#printButton').addEventListener('click', () => {
                    const printContent = `
                        <html>
                            <head>
                                <title>Print Orders</title>
                                <style>
                                    table {
                                        border-collapse: collapse;
                                        width: 100%;
                                        margin-top: 20px;
                                    }
                                    table, th, td {
                                        border: 1px solid black;
                                    }
                                    th, td {
                                        padding: 8px;
                                        text-align: left;
                                    }
                                    h4 {
                                        margin: 0;
                                    }
                                    .print-header {
                                        text-align: center;
                                        margin-bottom: 20px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="print-header">
                                    <h3>BILL OF MATERIALS</h3>
                                    <h4>Panel Number: ${panelNumber} | Date: ${date}</h4>
                                </div>
                                ${table.outerHTML}
                            </body>
                        </html>
                    `;
                    const printWindow = window.open('', '', 'width=1366,height=768');
                    printWindow.document.open();
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.print();
                });

                })
                .catch(err => console.error(err));
        }
    }
});