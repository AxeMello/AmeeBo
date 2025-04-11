document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('ordersList');

    if (ordersList) {
        fetch('http://192.168.100.129:5000/api/orders')
            .then(response => response.json())
            .then(orders => {
                orders.forEach(order => {
                    const intdate = order.orderDate.split('T')[0];
                    const [year, month, day] = intdate.split('-');
                    const date = `${day}-${month}-${year}`;
                    const orderItem = document.createElement('div');
                    orderItem.classList.add('order-item');
                    orderItem.innerHTML = `
                        <span>Order # ${order.id}</span>
                        <span>Panel Number: ${order.panelNumber}</span>
                        <span>Date: ${date}</span>
                        <span class="manager-status" style="font-weight: bold; cursor: pointer;" data-managerReason="${order.managerReason}">${order.managerStatus}</span>
                        <span class="store-status" style="font-weight: bold; cursor: pointer;" data-storeReason="${order.storeReason}">${order.storeStatus}</span>
                        <span class="check-status" style="font-weight: bold; cursor: pointer;" data-checkReason="${order.checkReason}">${order.checkStatus}</span>
                        <button class="view-order" data-pn="${order.panelNumber}" data-od="${date}">View</button>
                        <button class="edit-order" data-pn="${order.panelNumber}" data-od="${date}">Edit</button>
                        <button class="delete-order" data-pn="${order.panelNumber}">Delete</button>
                    `;
                    ordersList.appendChild(orderItem);
                });
            })
            .catch(err => console.error(err));
        
        //dropdown
        ordersList.addEventListener('click', (e) => {
            const target = e.target;

            // If managerStatus span is clicked
            if (target.classList.contains('manager-status')) {
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

                const managerReason = target.getAttribute('data-managerReason');
                // Dropdown content
                if (managerReason === 'null') {
                    Reason = 'All good!';
                    dropdown.innerHTML = `
                        <p style='margin: 0;' class="dropdown-item">${Reason}</p>
                    `;
                } else {
                    dropdown.innerHTML = `
                        <p style='margin: 0;' class="dropdown-item">${managerReason}</p>
                    `;
                }

                // Append to the body
                document.body.appendChild(dropdown);
            }

            // If storeStatus span is clicked
            else if (target.classList.contains('store-status')) {
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

            // If checkStatus span is clicked
            else if (target.classList.contains('check-status')) {
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

                const checkReason = target.getAttribute('data-checkReason') || 'All good!';
                // Dropdown content
                if (checkReason === 'null') {
                    Reason = 'All good!';
                    dropdown.innerHTML = `
                        <p style='margin: 0;' class="dropdown-item">${Reason}</p>
                    `;
                } else {
                    dropdown.innerHTML = `
                        <p style='margin: 0;' class="dropdown-item">${checkReason}</p>
                    `;
                }

                // Append to the body
                document.body.appendChild(dropdown);
            }

            // View, Edit, and Delete functionalities
            const panelNumber = target.dataset.pn;
            const date = target.dataset.od;

            if (target.classList.contains('view-order')) {
                window.location.href = `viewOrderDetails.html?panelNumber=${panelNumber}&date=${date}`;
            } else if (target.classList.contains('edit-order')) {
                window.location.href = `editOrder.html?panelNumber=${panelNumber}&date=${date}`;
            } else if (target.classList.contains('delete-order')) {
                const confirmDelete = confirm('Are you sure you want to delete this order?');
            
                if (confirmDelete) {
                    fetch(`http://192.168.100.1:5000/api/orders/${panelNumber}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Order deleted successfully!');
                            target.closest('.order-item').remove();
                        } else {
                            alert('Failed to delete the order.');
                        }
                    })
                    .catch(err => console.error(err));
                } else {
                    alert('Order deletion canceled.');
                }
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
