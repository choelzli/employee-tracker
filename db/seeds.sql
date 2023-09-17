INSERT INTO department (department_name)
VALUES ("Accounting"),
       ("Engineering"),
       ("Legal"),
       ("Marketing"),
       ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Accountant", 50000, 1),
       ("Staff Engineer", 55000, 2),
       ("Project Engineer", 85000, 2),
       ("Senior Engineer", 125000, 2),
       ("Legal Counsel", 110000, 3),
       ("Marketing Director", 130000, 4),
       ("Salesperson", 50000, 5),
       ("Lead Salesperson", 75000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
        ("Arthur", "Smith", 6, NULL),
        ("Desmond", "Ridder", 4, NULL),
        ("Taylor", "Heinicke", 3, 2),
        ("Logan", "Woodside", 2, 3),
        ("Bijan", "Robinson", 8, 1),
        ("Tyler", "Allgeier", 7, 5),
        ("Kyle", "Pitts", 1, 1),
        ("Drake", "London", 5, NULL),
        ("Mack", "Hollins", 5, 8);
    