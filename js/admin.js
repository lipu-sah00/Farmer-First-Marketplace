async function loadPage(page) {
    try {
        const response = await fetch(page);

        if (!response.ok) {
            throw new Error("Page not found");
        }

        const html = await response.text();
        document.getElementById("content").innerHTML = html;

        // Initialize page after loading
        if (page.includes("dashboard.html")) {
            initFarmerTable();
        }

    } catch (err) {
        console.error(err);
        document.getElementById("content").innerHTML =
            "<h2>Unable to load page.</h2>";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadPage("module/admin/dashboard.html");
});


function initFarmerTable() {

    const farmers = [
        {
            id: 1,
            name: "Ramesh Kumar",
            phone: "9876543210",
            city: "Bangalore",
            lastLogin: "22 Jul 2026 09:30 AM",
            status: "Active"
        },
        {
            id: 2,
            name: "Suresh Patil",
            phone: "9988776655",
            city: "Mysore",
            lastLogin: "21 Jul 2026 05:20 PM",
            status: "Inactive"
        },
        {
            id: 3,
            name: "Rajesh Singh",
            phone: "9123456780",
            city: "Delhi",
            lastLogin: "20 Jul 2026 11:45 AM",
            status: "Active"
        },
        {
            id: 4,
            name: "Amit Verma",
            phone: "9011223344",
            city: "Lucknow",
            lastLogin: "19 Jul 2026 08:10 PM",
            status: "Active"
        },
        {
            id: 5,
            name: "Deepak Das",
            phone: "9870011223",
            city: "Kolkata",
            lastLogin: "18 Jul 2026 09:15 AM",
            status: "Inactive"
        },
        {
            id: 6,
            name: "Prakash Rao",
            phone: "9988001122",
            city: "Hyderabad",
            lastLogin: "17 Jul 2026 06:40 PM",
            status: "Active"
        },
        {
            id: 7,
            name: "Manoj Yadav",
            phone: "9898989898",
            city: "Patna",
            lastLogin: "16 Jul 2026 02:25 PM",
            status: "Inactive"
        },
        {
            id: 8,
            name: "Sunil Sharma",
            phone: "9001122334",
            city: "Jaipur",
            lastLogin: "15 Jul 2026 01:30 PM",
            status: "Active"
        },
        {
            id: 9,
            name: "Kiran Patel",
            phone: "9871234567",
            city: "Ahmedabad",
            lastLogin: "14 Jul 2026 07:15 PM",
            status: "Active"
        },
        {
            id: 10,
            name: "Ravi Naik",
            phone: "9988771234",
            city: "Goa",
            lastLogin: "13 Jul 2026 10:20 AM",
            status: "Inactive"
        },
        {
            id: 11,
            name: "Hari Mohan",
            phone: "9876541200",
            city: "Bhubaneswar",
            lastLogin: "12 Jul 2026 04:00 PM",
            status: "Active"
        },
        {
            id: 12,
            name: "Anil Reddy",
            phone: "9888774455",
            city: "Chennai",
            lastLogin: "11 Jul 2026 08:30 AM",
            status: "Inactive"
        },
        {
            id: 13,
            name: "Rahul Mishra",
            phone: "9991122334",
            city: "Kanpur",
            lastLogin: "10 Jul 2026 09:00 PM",
            status: "Active"
        },
        {
            id: 14,
            name: "Ganesh Pawar",
            phone: "9765432101",
            city: "Pune",
            lastLogin: "09 Jul 2026 11:20 AM",
            status: "Inactive"
        },
        {
            id: 15,
            name: "Bikash Rout",
            phone: "9437001122",
            city: "Cuttack",
            lastLogin: "08 Jul 2026 06:15 PM",
            status: "Active"
        },
        {
            id: 16,
            name: "Ajay Kumar",
            phone: "9123123123",
            city: "Noida",
            lastLogin: "07 Jul 2026 03:10 PM",
            status: "Active"
        },
        {
            id: 17,
            name: "Sanjay Gupta",
            phone: "9870000001",
            city: "Indore",
            lastLogin: "06 Jul 2026 12:45 PM",
            status: "Inactive"
        },
        {
            id: 18,
            name: "Mohan Sahu",
            phone: "9437123456",
            city: "Sambalpur",
            lastLogin: "05 Jul 2026 05:55 PM",
            status: "Active"
        },
        {
            id: 19,
            name: "Naveen Joshi",
            phone: "9871112223",
            city: "Dehradun",
            lastLogin: "04 Jul 2026 09:05 AM",
            status: "Inactive"
        },
        {
            id: 20,
            name: "Ashok Nayak",
            phone: "9438111222",
            city: "Rourkela",
            lastLogin: "03 Jul 2026 07:40 PM",
            status: "Active"
        }
    ];

    const tbody = document.querySelector("#farmerTable tbody");

    function render(data) {

        tbody.innerHTML = "";

        data.forEach(f => {

            tbody.innerHTML += `
                <tr>
                    <td>${f.id}</td>
                    <td>${f.name}</td>
                    <td>${f.phone}</td>
                    <td>${f.city}</td>
                    <td>${f.lastLogin}</td>
                    <td>
                        <span class="status ${f.status.toLowerCase()}">
                            ${f.status}
                        </span>
                    </td>
                    <td>
                        <button class="edit-btn">Edit</button>
                    </td>
                </tr>
            `;

        });

    }

    render(farmers);

    document
        .getElementById("searchFarmer")
        .addEventListener("input", function () {

            const value = this.value.toLowerCase();

            const filtered = farmers.filter(f =>

                f.name.toLowerCase().includes(value) ||

                f.phone.includes(value) ||

                f.city.toLowerCase().includes(value) ||

                f.status.toLowerCase().includes(value)

            );

            render(filtered);

        });

}