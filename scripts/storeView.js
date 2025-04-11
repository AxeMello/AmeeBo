document.addEventListener('DOMContentLoaded', () => {
    const storeList = document.getElementById('storeList');

    if (storeList) {
        Promise.all([
            fetch('http://192.168.100.129:5000/api/approvedorders').then(res => res.json()),
            fetch('http://192.168.100.129:5000/api/orders').then(res => res.json())
        ])
            .then(([storeorders, mainorders]) => {
                storeorders.forEach(order => {
                    const intdate = order.orderDate.split('T')[0]; // Assuming 'date' is in YYYY-MM-DD format
                    const [year, month, day] = intdate.split('-');  // Split the date string by '-'
                    const date = `${day}-${month}-${year}`; // Rearrange to MM-DD-YYYY
                    const orderItem = document.createElement('div');

                    // Find the corresponding order from all orders based on panelNumber
                    const matchingOrder = mainorders.find(o => o.panelNumber === order.panelNumber);
                    const issueText = matchingOrder ? matchingOrder.storeStatus : 'not issued yet';
                    const storeReason = matchingOrder ? matchingOrder.storeReason : 'null';

                    orderItem.classList.add('order-item');
                    orderItem.innerHTML = `
                        <span>Order - ${order.id}</span>
                        <span>Panel Number: ${order.panelNumber}</span>
                        <span>Date: ${date}</span>
                        <span class="store-status" id="issueText" style="font-weight: bold; cursor: pointer;" data-storeReason="${storeReason}">${issueText}</span>
                        <button class="view-order" data-pn="${order.panelNumber}" data-od="${date}">View</button>
                    `;
                    storeList.appendChild(orderItem);
                });
            })
            .catch(err => console.error(err));
        
            storeList.addEventListener('click', (e) => {
            const target = e.target;

            // If checkStatus span is clicked
            if (target.classList.contains('store-status')) {
                // Remove any existing dropdowns
                document.querySelectorAll('.dropdown-overlay').forEach(dropdown => dropdown.remove());

                // Create a dropdown overlay
                const dropdown = document.createElement('div');
                dropdown.classList.add('dropdown-overlay');
                dropdown.style.position = 'absolute';
                dropdown.style.top = `${target.getBoundingClientRect().bottom + window.scrollY - 30}px`;
                dropdown.style.left = `${target.getBoundingClientRect().left - 7}px`;
                dropdown.style.border = '1px solid #ccc';
                dropdown.style.borderRadius = '10px';
                dropdown.style.backgroundColor = '#fff';
                dropdown.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                dropdown.style.padding = '10px';
                dropdown.style.zIndex = '1000';

                const storeReason = target.getAttribute('data-storeReason') || 'All good!';
                // Dropdown content
                if (storeReason === 'null') {
                    Reason = 'All good!';
                    dropdown.innerHTML = `
                        <p style='margin: 0;' class="dropdown-item">${Reason}</p>
                    `;
                } else {
                    dropdown.innerHTML = `
                        <p style='margin: 0;' class="dropdown-item">${storeReason}</p>
                    `;
                }

                // Append to the body
                document.body.appendChild(dropdown);
            }

            if (target.classList.contains('view-order')) {
                const panelNumber = target.dataset.pn;
                const date = target.dataset.od;
                window.location.href = `storeViewDetails.html?panelNumber=${panelNumber}&date=${date}`;
            }
        });
                // Remove dropdown if clicked outside
                document.addEventListener('click', (event) => {
                    const dropdown = document.querySelector('.dropdown-overlay');
                    if (dropdown && !dropdown.contains(event.target) && !event.target.classList.contains('manager-status') && !event.target.classList.contains('store-status') && !event.target.classList.contains('check-status')) {
                        dropdown.remove();
                    }
                });
    }
});