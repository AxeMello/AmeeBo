-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 16, 2025 at 08:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `billorderdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `approvedorderdetails`
--

CREATE TABLE `approvedorderdetails` (
  `slno` int(11) NOT NULL,
  `panelNumber` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `current` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `orderDescription` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `accessories` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvedorderdetails`
--

INSERT INTO `approvedorderdetails` (`slno`, `panelNumber`, `description`, `current`, `quantity`, `orderDescription`, `remarks`, `accessories`) VALUES
(1, '001', 'ACB 1', '2500', 1, 'E2.2N 2500 Ekip Dip LSIG 3p WMP', 'make: ABB', 'No'),
(2, '001', 'MCCB 1', '800', 1, 'XT6S 800 Ekip Dip LS/I In=800 3p F F', 'make: ABB', 'No'),
(3, '001', 'MCCB 2', '630', 1, 'XT6S 630 Ekip Dip LS/I In=630 3p F F', 'make: ABB', 'No'),
(4, '001', 'FUSE HOLDER', '', 4, 'HRT 18 32Z', 'make: HIMEL', 'Yes');

--
-- Triggers `approvedorderdetails`
--
DELIMITER $$
CREATE TRIGGER `before_insert_approvedorderdetails` BEFORE INSERT ON `approvedorderdetails` FOR EACH ROW BEGIN
    DECLARE max_slno INT;

    
    SELECT MAX(slno) INTO max_slno
    FROM approvedorderdetails
    WHERE panelNumber = NEW.panelNumber;

    
    IF max_slno IS NULL THEN
        SET NEW.slno = 1;  
    ELSE
        SET NEW.slno = max_slno + 1;  
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `approvedorders`
--

CREATE TABLE `approvedorders` (
  `id` int(11) NOT NULL,
  `panelNumber` varchar(255) NOT NULL,
  `orderDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvedorders`
--

INSERT INTO `approvedorders` (`id`, `panelNumber`, `orderDate`) VALUES
(1, '001', '2025-01-13');

-- --------------------------------------------------------

--
-- Table structure for table `orderdetails`
--

CREATE TABLE `orderdetails` (
  `slno` int(11) NOT NULL,
  `panelNumber` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `current` varchar(225) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `orderDescription` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `accessories` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderdetails`
--

INSERT INTO `orderdetails` (`slno`, `panelNumber`, `description`, `current`, `quantity`, `orderDescription`, `remarks`, `accessories`) VALUES
(0, '001', 'ACB 1', '2500', 1, 'E2.2N 2500 Ekip Dip LSIG 3p WMP', 'make: ABB', 'No'),
(0, '001', 'MCCB 1', '800', 1, 'XT6S 800 Ekip Dip LS/I In=800 3p F F', 'make: ABB', 'No'),
(0, '001', 'MCCB 2', '630', 1, 'XT6S 630 Ekip Dip LS/I In=630 3p F F', 'make: ABB', 'No'),
(0, '001', 'FUSE HOLDER', '', 4, 'HRT 18 32Z', 'make: HIMEL', 'Yes'),
(1, '002', 'ACB 1', '2500', 1, 'E2.2N 2500 Ekip Dip LSIG 3p WMP', 'make: ABB', 'Yes'),
(2, '002', 'MCCB 1', '800', 2, 'XT6S 800 Ekip Dip LS/I In=800 3p F F', 'make: ABB', 'No'),
(3, '002', 'fuse', '', 3, '', 'make: HIMEL', 'No');

--
-- Triggers `orderdetails`
--
DELIMITER $$
CREATE TRIGGER `before_insert_orderdetails` BEFORE INSERT ON `orderdetails` FOR EACH ROW BEGIN
    DECLARE max_serial INT;

    
    SELECT MAX(slno) INTO max_serial
    FROM orderdetails
    WHERE panelNumber = NEW.panelNumber;

    
    IF max_serial IS NULL THEN
        SET NEW.slno = 1;  
    ELSE
        SET NEW.slno = max_serial + 1;  
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `panelNumber` varchar(255) NOT NULL,
  `orderDate` date NOT NULL,
  `managerStatus` varchar(50) NOT NULL DEFAULT 'not sent for approval',
  `storeStatus` varchar(50) NOT NULL DEFAULT 'no approval yet',
  `checkStatus` varchar(50) NOT NULL DEFAULT 'not checked yet',
  `managerReason` varchar(500) DEFAULT NULL,
  `storeReason` varchar(500) DEFAULT NULL,
  `checkReason` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `panelNumber`, `orderDate`, `managerStatus`, `storeStatus`, `checkStatus`, `managerReason`, `storeReason`, `checkReason`) VALUES
(1, '001', '2025-01-15', 'Approved', 'Issued', 'checked', NULL, NULL, NULL),
(2, '002', '2025-01-14', 'Sent for Approval', 'Pending', 'not checked yet', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sentorderdetails`
--

CREATE TABLE `sentorderdetails` (
  `slno` int(11) NOT NULL,
  `panelNumber` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `current` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `orderDescription` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `accessories` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sentorderdetails`
--

INSERT INTO `sentorderdetails` (`slno`, `panelNumber`, `description`, `current`, `quantity`, `orderDescription`, `remarks`, `accessories`) VALUES
(1, '001', 'ACB 1', '2500', 1, 'E2.2N 2500 Ekip Dip LSIG 3p WMP', 'make: ABB', 'No'),
(2, '001', 'MCCB 1', '800', 1, 'XT6S 800 Ekip Dip LS/I In=800 3p F F', 'make: ABB', 'No'),
(3, '001', 'MCCB 2', '630', 1, 'XT6S 630 Ekip Dip LS/I In=630 3p F F', 'make: ABB', 'No'),
(4, '001', 'FUSE HOLDER', '', 4, 'HRT 18 32Z', 'make: HIMEL', 'Yes'),
(1, '002', 'ACB 1', '2500', 1, 'E2.2N 2500 Ekip Dip LSIG 3p WMP', 'make: ABB', 'Yes'),
(2, '002', 'MCCB 1', '800', 2, 'XT6S 800 Ekip Dip LS/I In=800 3p F F', 'make: ABB', 'No'),
(3, '002', 'fuse', '', 3, '', 'make: HIMEL', 'No');

--
-- Triggers `sentorderdetails`
--
DELIMITER $$
CREATE TRIGGER `before_insert_sentorderdetails` BEFORE INSERT ON `sentorderdetails` FOR EACH ROW BEGIN
    DECLARE max_serial INT;

    
    SELECT MAX(slno) INTO max_serial
    FROM sentorderdetails
    WHERE panelNumber = NEW.panelNumber;

    
    IF max_serial IS NULL THEN
        SET NEW.slno = 1;  
    ELSE
        SET NEW.slno = max_serial + 1;  
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `sentorders`
--

CREATE TABLE `sentorders` (
  `id` int(11) NOT NULL,
  `panelNumber` varchar(255) NOT NULL,
  `orderDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sentorders`
--

INSERT INTO `sentorders` (`id`, `panelNumber`, `orderDate`) VALUES
(2, '001', '2025-01-14'),
(3, '002', '2025-01-13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `approvedorders`
--
ALTER TABLE `approvedorders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `panelNumber` (`panelNumber`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `panelNumber` (`panelNumber`);

--
-- Indexes for table `sentorders`
--
ALTER TABLE `sentorders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `panelNumber` (`panelNumber`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `approvedorders`
--
ALTER TABLE `approvedorders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sentorders`
--
ALTER TABLE `sentorders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
