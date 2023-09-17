async function init() {
    const inquirer = require('inquirer');
    const mysql = require('mysql2');
    
    try {
        const db = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'employees_db',
        });
        console.log(`Connected to the employees_db database.`);

        const menu = [
            {
                type: 'list',
                name: 'selection_menu',
                message: 'What would you like to do?',
                choices: [
                    "View all Employees",
                    "Add Employee",
                    "Update Employee Role",
                    "View all Roles",
                    "Add Role",
                    "View all Departments",
                    "Add Department",
                    "Quit",
                ],
            },
        ];

        function displayMenu() {
            return inquirer.prompt(menu);
        }

        async function handleUserInput(answer) {
            switch (answer.selection_menu) {
                case "View all Employees":
                    viewEmployees();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Update Employee Role":
                    updateEmployee();
                    break;
                case "View all Roles":
                    viewRoles();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "View all Departments":
                    viewDepartments();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Quit":
                    console.log("Session ended.");
                    //  Close database connection
                    db.end();
                    break;
                default:
                    await displayMenu().then(handleUserInput);
            }
            
        }

        // View all employees
        async function viewEmployees() {
            db.query(
                "SELECT e.id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, \' \', m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id JOIN role ON e.role_id = role.id JOIN department ON role.department_id = department.id;",
                (err, result) => {
                    console.table(result);
                    // console.error("Query error: view all employees", err);
                    init();
                }
            );
        }

        // Add an employee
        function addEmployee() {
            const roles = [];
            const managers = [];

            db.query(
                "SELECT title FROM role;",
                (err, result) => {
                    result.forEach(element => roles.push(element.title));
                    // console.error("Query error: add employee", err);
                    db.query(
                        "SELECT first_name,last_name FROM employee",
                        (err1, result1) => {
                            result1.forEach(newEmployee => {
                                managers.push(`${newEmployee.first_name} ${newEmployee.last_name}`);
                            })
                            // console.error("Query error: add new employee's manager", err1);
                            inquirer.prompt
                        }
                    )
                    const addEmployeeQuestions = [{
                        type: 'input',
                        message: "What is the employee's first name?",
                        name: "firstName"
                    }, {
                        type: 'input',
                        message: "What is the employee's last name?",
                        name: "lastName"
                    }, {
                        type: 'list',
                        message: "What is the employee's role?",
                        name: 'role',
                        choices: roles
                    }, {
                        type: 'list',
                        message: "Who is the employee's manager?",
                        name: 'manager',
                        choices: managers
                    }]
                    inquirer
                        .prompt(addEmployeeQuestions)
                        .then((answer) => {
                            const roleId = roles.indexOf(answer.role) + 1;
                            const managerId = answer.manager === managers.indexOf(answer.manager) || 'null';

                            db.query(
                                `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ('${answer.firstName}','${answer.lastName}',${roleId},${managerId})`, 
                                (err2, result2) => {
                                    // console.error("Query error: updating Employee role", err2);
                                    console.log("Added new employee to the database");
                                    init();
                                }
                            )
                        })
                }
            )
        }

        // View all roles
        function viewRoles() {
            db.query(
                "SELECT role.id, role.title, department.department_name, role.salary FROM role JOIN department ON role.department_id = department.id",
                (err, result) => {
                    console.table(result);
                    // console.error("Query error: view all roles", err);
                    init();
                }
            );
        }

        // Add a role
        async function addRole() {
            const departments = [];
            db.query(
                "SELECT department_name FROM department;",
                (err, result) => {
                    result.forEach(element => {
                        departments.push(element.department_name);
                    })
                    // console.error("Query error: adding new role's department", err);
                }
            );

            const addRoleQuestions = [{
                type: 'input',
                message: "What is the name of the role?",
                name: "title"
            }, {
                type: 'input',
                message: "What is the salary of the role?",
                name: "salary"
            }, {
                type: 'list',
                message: "Which department does the role belong to?",
                name: 'department',
                choices: departments
            }]

            inquirer
                .prompt(addRoleQuestions)
                .then((answer) => {
                    const id = departments.indexOf(answer.department) + 1;

                    db.query(
                        `INSERT INTO role (title, salary, department_id) VALUES ('${answer.title}',${answer.salary},${id});`,
                        (err1, result1) => {
                            // console.error("Query error: adding role to database", err1);
                            console.log("Added role to the database");
                            init();
                        }
                    )
                }
            )
        }

        // Update an employee role
        async function updateEmployee() {
            let role_current;
            const employees = [];
            const roles = [];
            db.query(
                'SELECT concat(employee.first_name,\' \',employee.last_name) as  name, role.title FROM employee JOIN role ON employee.role_id = role.id',

                (err, result) => {
                    // console.error("Query error: joining current role to employeee", err);
                    result.forEach(element => {
                        employees.push(element.name);

                        if(roles.indexOf(element.title) === -1) {
                            roles.push(element.title);
                        }
                    })

                    const updateEmployeeQuestion = {
                        type: "list",
                        message: "Which employee do you want to update?",
                        name: 'employeeUpdate',
                        choices: employees
                    }
                    
                    const updateRoleQuestion = {
                        type: "list",
                        message: "What is the employee's updated role?",
                        name: 'roleUpdate',
                        choices: roles.filter(role => role !== role_current)
                    }
                    
                    inquirer
                        .prompt(updateEmployeeQuestion)
                        .then((answer) => {
                            result.forEach(object => {
                                if (object.name === answer.employeeUpdate) {
                                    role_current = object.title;
                                }
                            })
                            inquirer.prompt(updateRoleQuestion)
                            .then((answer1) => {
                                db.query(
                                    "SELECT role.id FROM role WHERE role.title = ?",
                                    answer1.roleUpdate,
                                    (err1, result1) => {
                                        // console.error("Query error: cannot find role", err1);
                                        db.query(
                                            `UPDATE employee SET role_id=${result1[0].id} WHERE concat(employee.first_name,\' \',employee.last_name) ="${answer1.employeeUpdate}";`, 
                                            (err2, result2) => {
                                                // console.error("Query error: cannot update employee's role", err2);
                                                console.log("Employee's role updated!");
                                                init();
                                            }
                                        )
                                    }
                                )
                            })
                        })
                }
            )
        }

        // View all departments
        function viewDepartments() {
            db.query(
                "SELECT * FROM department",
                (err, result) => {
                    console.table(result);
                    // console.error(err);
                    init();
                }
            );
        }

        // Add a department
        function addDepartment() {
            const addDepartmentQuestion = {
                type: 'input',
                message: 'What is the name of the department?',
                name: 'name'
            }

            inquirer
                .prompt([addDepartmentQuestion])
                .then((answer) => {
                    db.query(
                        `INSERT INTO department (department_name) VALUES ('${answer.name}');`,
                        (err, result) => {
                            console.log(result + ' department added!');
                            // console.error("Query error: adding new department", err);
                            init();
                        }
                    )
                })
        }
                        

        async function menuLoad() {
            try {
                displayMenu()
                    .then(handleUserInput)
                    .catch((err) => {
                        console.error("Error displaying menu:", err);
                    });
            } catch (err) {
                console.error("Error loading menu:", err);
            }
        }

        menuLoad();
    } catch (err) {
        console.error("Error initializing:", err);
    }
}

// Call init to start the application
init();