document.addEventListener('DOMContentLoaded', () => {
    const storeDetails = document.getElementById('storeDetails');

    if (storeDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const panelNumber = urlParams.get('panelNumber');
        const date = urlParams.get('date');
        if (panelNumber != null) {
            fetch(`http://192.168.100.129:5000/api/approvedorders/details/${panelNumber}`)
                .then(response => response.json())
                .then(orders => {
                    const storeDetailsContainer = document.getElementById('storeDetails');

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
                            <button type="button" id="issueButton" class="issue-button">Done</button>
                            <button type="button" id="OoSButton" class="OoS-button">Out of Stock</button>
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

                    // issue Button
                    table.querySelector('#issueButton').addEventListener('click', () => {
                        fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ managerStatus: 'Approved', storeStatus: 'Issued', checkStatus: 'not checked yt' })
                        })
                            .then(updateResponse => {
                                if (updateResponse.ok) {
                                    alert('Order issued successfully and status updated!');
                                    // Update the issueText element in storeView.html
                                    const issueText = document.querySelector(`#storeList .order-item button[data-pn="${panelNumber}"]`).previousElementSibling;
                                    if (issueText) {
                                        issueText.textContent = 'Issued';
                                    }
                                    window.location.href = 'storeView.html';
                                    } else {
                                        alert('Failed to update status.');
                                    }
                            });
                    });

                    // Out of Stock button function
                    table.querySelector('#OoSButton').addEventListener('click', () => {
                        const storeReason = prompt("Check the items that are out of stock! and Please provide reason if any:");

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

                        if (storeReason || checkedItems.length > 0) {

                            // Append the checked items to the storeReason
                            const finalReason = checkedItems.length > 0
                                ? `${storeReason} - Out of stock items: ${checkedItems.join(', ')}`
                                : storeReason;

                            fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    managerStatus: 'Approved',
                                    storeStatus: 'out of stock',
                                    checkStatus: 'not checked yet',
                                    storeReason: finalReason,
                                }),
                            })
                                .then(updateResponse => {
                                    if (updateResponse.ok) {
                                        alert('Order marked as Out of Stock! Status updated.');
                                        window.location.href = 'storeView.html'; // Redirect to the store view page
                                    } else {
                                        alert('Failed to update status.');
                                    }
                                })
                                .catch(err => {
                                    console.error('Error updating status:', err);
                                    alert('Failed to update status.');
                                });
                        } else {
                            alert('Reason OR check items that are Out of Stock!');
                        }
                    });

                    // Add event listener to the "download" button
                    p.querySelector('#downloadButton').addEventListener('click', () => {
                        const table = document.getElementById('storeDetails');
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

                    // Append the table to the container
                    storeDetailsContainer.appendChild(p);
                    storeDetailsContainer.appendChild(table);
                })
                .catch(err => console.error(err));
        }
    }
});