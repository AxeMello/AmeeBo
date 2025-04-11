document.addEventListener('DOMContentLoaded', () => {
    const orderDetails = document.getElementById('orderDetails');

    if (orderDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const panelNumber = urlParams.get('panelNumber');
        const date = urlParams.get('date');

        if (panelNumber) {
            // Fetch orders data
            Promise.all([
                fetch(`http://192.168.100.129:5000/api/orders`).then(res => res.json()),
                fetch(`http://192.168.100.129:5000/api/orders/details/${panelNumber}`).then(res => res.json())
            ])
                .then(([orders, orderDetails]) => {
                    // Filter the data to get only the matching panelNumber
                    const order = orders.find(o => o.panelNumber === panelNumber);
                    const matchingDetails = orderDetails.filter(detail => detail.panelNumber === panelNumber);

                    // Display the data in the table
                    const orderDetailsContainer = document.getElementById('orderDetails');
                    const p = document.createElement('p');
                    p.innerHTML = `
                        <h4 style="position: relative; left: 105px;">Panel Number: ${panelNumber}</h4>
                        <h4 style="position:absolute; top: 113px; right: 145px;">Date: ${date}</h4>
                        <button type="button" id="printButton" class="print-button">Print</button>
                        <button type="button" id="downloadButton" class="download-button">download</button>
                    `;

                    const table = document.createElement('table');
                    table.setAttribute('id', 'orderDetails'); // Add an ID to the table for reference
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
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                        <br>
                        <div class="horizontal-center">
                            <button type="button" id="sendButton" class="send-button">Send for Approval</button>
                        </div>
                    `;

                    const tableBody = table.querySelector('tbody');

                    matchingDetails.forEach(detail => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td data="slno">${detail.slno}</td>
                            <td data="description">${detail.description}</td>
                            <td data="current">${detail.current}</td>
                            <td data="quantity">${detail.quantity}</td>
                            <td data="orderDescription">${detail.orderDescription}</td>
                            <td data="remarks">${detail.remarks}</td>
                            <td data="accessories">${detail.accessories}</td>
                        `;
                        tableBody.appendChild(row);
                    });

                    // Add event listener to the "Send for Approval" button
                    table.querySelector('#sendButton').addEventListener('click', () => {
                        // Prepare data to send
                        const rows = Array.from(document.querySelectorAll('table tbody tr')).map(row => ({
                            slno: row.querySelector('td[data="slno"]').textContent.trim(),
                            description: row.querySelector('td[data="description"]').textContent.trim(),
                            current: row.querySelector('td[data="current"]').textContent.trim(),
                            quantity: parseInt(row.querySelector('td[data="quantity"]').textContent.trim()),
                            orderDescription: row.querySelector('td[data="orderDescription"]').textContent.trim(),
                            remarks: row.querySelector('td[data="remarks"]').textContent.trim(),
                            accessories: row.querySelector('td[data="accessories"]').textContent.trim()
                        }));

                        const [day, month, year] = date.split('-');
                        const formattedDate = `${year}-${month}-${day}`; // Default SQL date format YYYY-MM-DD

                        const payload = {
                            panelNumber: panelNumber,
                            orderDate: formattedDate,
                            rows
                        };

                        // Send the order details to the backend
                        fetch('http://192.168.100.129:5000/api/sentorders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        })
                            .then(response => {
                                if (response.ok) {
                                    fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ managerStatus: 'Sent for Approval', storeStatus: 'Pending', checkStatus: 'not checked yet' })
                                    })
                                        .then(updateResponse => {
                                            if (updateResponse.ok) {
                                                alert('Order sent successfully and status updated!');
                                                window.location.href = 'viewOrder.html'; // Redirect to view order page
                                            } else {
                                                alert('Failed to update status.');
                                            }
                                        })
                                        .catch(err => {
                                            console.error('Error updating status:', err);
                                            alert('Failed to update status.');
                                        });
                                } else {
                                    alert('Failed to send the order.');
                                }
                            })
                            .catch(err => console.error(err));
                    });

                    // Add event listener to the "download" button
                    p.querySelector('#downloadButton').addEventListener('click', () => {
                        const table = document.getElementById('orderDetails');
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

                    orderDetailsContainer.appendChild(p);
                    orderDetailsContainer.appendChild(table);
                })
                .catch(err => console.error(err));
        }
    }
});