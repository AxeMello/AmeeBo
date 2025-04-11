document.addEventListener('DOMContentLoaded', () => {
    const managerDetails = document.getElementById('managerDetails');

    if (managerDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const panelNumber = urlParams.get('panelNumber');
        const date = urlParams.get('date');
        if(panelNumber!=null){
            fetch(`http://192.168.100.129:5000/api/sentorders/details/${panelNumber}`)
            .then(response => response.json())
            .then(orders => {
                const managerDetailsContainer = document.getElementById('managerDetails'); 
        
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
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                    <br>
                    <div class="horizontal-center">
                        <button type="button" id="approveButton" class="approve-button">Approve Order</button>
                        <button type="button" id="rejectButton" class="reject-button">Reject Order</button>
                    </div>                    
                `;
        
                // Get the `<tbody>` to append rows
                const tableBody = table.querySelector('tbody');
        
                // Iterate through the orders and add rows
                orders.forEach(detail => {
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
                
                //approve order button function
                table.querySelector('#approveButton').addEventListener('click', () => {
                    // Prepare data to approve
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
                    const formattedDate = `${year}-${month}-${day}`;    //default sql date format YYYY-MM-DD
                    
                    const payload = {
                        panelNumber: panelNumber,
                        orderDate: formattedDate,
                        rows
                    };                        
        
                    fetch('http://192.168.100.129:5000/api/approvedorders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })
                        .then(response => {
                            if (response.ok) {
                                fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ managerStatus: 'Approved', storeStatus: 'ongoing', checkStatus: 'not checked yet' })
                                })
                                .then(updateResponse => {
                                    if (updateResponse.ok) {
                                        alert('Order approved successfully and status updated!');
                                        window.location.href = 'managerView.html';  // Redirect to view order page
                                    } else {
                                        alert('Failed to update status.');
                                    }
                                })
                                .catch(err => {
                                    console.error('Error updating status:', err);
                                    alert('Failed to update status.');
                                }); 
                            } else {
                                alert('Failed to approve order.');
                            }
                        })
                        .catch(err => console.error(err));
                });

                // rejectOrder button function
                table.querySelector('#rejectButton').addEventListener('click', () => {
                const rejectionReason = prompt("Please provide the reason for rejection:");

                if (rejectionReason) {
                    fetch(`http://192.168.100.129:5000/api/orders/${panelNumber}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    managerStatus: 'Rejected',
                    storeStatus: 'not issued',
                    checkStatus: 'not checked yet',
                    managerReason: rejectionReason
                    })
                })
                .then(updateResponse => {
                if (updateResponse.ok) {
                    alert('Order rejected successfully and status updated!');
                    window.location.href = 'managerView.html';
                } else {
                    alert('Failed to update status.');
                }
            })
            .catch(err => {
                console.error('Error updating status:', err);
                alert('Failed to update status.');
            });
        } else {
            alert('Rejection reason is required!');
        }
        });

                // Add event listener to the "download" button
                p.querySelector('#downloadButton').addEventListener('click', () => {
                    const table = document.getElementById('managerDetails');
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
                managerDetailsContainer.appendChild(p);
                managerDetailsContainer.appendChild(table);
            })
            .catch(err => console.error(err));        
        }
    }
});