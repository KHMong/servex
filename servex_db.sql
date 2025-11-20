-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2025 at 03:21 PM
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
-- Database: `servex_db`
--
CREATE DATABASE IF NOT EXISTS `servex_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `servex_db`;

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `skill_level_id` bigint(20) UNSIGNED NOT NULL,
  `fee` decimal(8,2) NOT NULL,
  `max_player` int(11) NOT NULL,
  `status` enum('Open','Full','Completed','Cancelled') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity`
--

INSERT INTO `activity` (`id`, `user_id`, `booking_id`, `skill_level_id`, `fee`, `max_player`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 2, 10.00, 4, 'Full', '2026-03-10 01:15:05', '2026-03-10 01:15:05'),
(2, 3, 2, 3, 15.00, 6, 'Open', '2026-03-11 03:20:05', '2026-03-11 03:20:05'),
(3, 4, 3, 1, 5.00, 8, 'Open', '2026-03-12 06:00:05', '2026-03-12 06:00:05'),
(4, 5, 4, 2, 12.00, 4, 'Open', '2026-03-13 08:45:05', '2026-03-13 08:45:05'),
(5, 6, 5, 3, 20.00, 2, 'Full', '2026-03-14 10:00:05', '2026-03-14 10:00:05'),
(6, 7, 6, 4, 25.00, 4, 'Open', '2026-03-15 00:30:05', '2026-03-15 00:30:05'),
(7, 8, 7, 1, 10.00, 6, 'Open', '2026-03-16 05:10:05', '2026-03-16 05:10:05'),
(8, 9, 8, 2, 5.00, 4, 'Open', '2026-03-17 02:00:05', '2026-03-17 02:00:05');

-- --------------------------------------------------------

--
-- Table structure for table `activity_participant`
--

CREATE TABLE `activity_participant` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `activity_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('Joined','Left','Removed') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_participant`
--

INSERT INTO `activity_participant` (`id`, `user_id`, `activity_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Joined', '2026-03-11 02:00:00', '2026-03-11 02:00:00'),
(2, 4, 1, 'Joined', '2026-03-12 03:00:00', '2026-03-12 03:00:00'),
(3, 5, 1, 'Joined', '2026-03-13 04:00:00', '2026-03-13 04:00:00'),
(4, 3, 2, 'Joined', '2026-03-12 07:00:00', '2026-03-12 07:00:00'),
(5, 7, 2, 'Joined', '2026-03-14 08:00:00', '2026-03-14 08:00:00'),
(6, 4, 3, 'Joined', '2026-03-12 07:00:00', '2026-03-12 07:00:00'),
(7, 5, 4, 'Joined', '2026-03-15 11:00:00', '2026-03-15 11:00:00'),
(8, 6, 5, 'Joined', '2026-03-16 12:00:00', '2026-03-16 12:00:00'),
(9, 7, 6, 'Joined', '2026-03-17 13:00:00', '2026-03-17 13:00:00'),
(10, 8, 7, 'Joined', '2026-03-12 07:00:00', '2026-03-12 07:00:00'),
(11, 9, 8, 'Joined', '2026-03-18 14:00:00', '2026-03-18 14:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `court_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` varchar(255) NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `total_price` decimal(8,2) NOT NULL,
  `payment_status` enum('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `status` enum('Pending','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`id`, `user_id`, `court_id`, `booking_id`, `start_datetime`, `end_datetime`, `total_price`, `payment_status`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'B26040410000001', '2026-04-04 10:00:00', '2026-04-04 12:00:00', 50.00, 'Paid', 'Confirmed', '2026-03-10 01:15:00', '2026-03-10 01:15:00'),
(2, 3, 41, 'B26040515000001', '2026-04-05 15:00:00', '2026-04-05 17:00:00', 70.00, 'Paid', 'Confirmed', '2026-03-11 03:20:00', '2026-03-11 03:20:00'),
(3, 4, 68, 'B26040820000001', '2026-04-08 20:00:00', '2026-04-08 22:00:00', 38.00, 'Paid', 'Confirmed', '2026-03-12 06:00:00', '2026-03-12 06:00:00'),
(4, 5, 109, 'B260411140001', '2026-04-11 14:00:00', '2026-04-11 16:00:00', 44.00, 'Paid', 'Confirmed', '2026-03-13 08:45:00', '2026-03-13 08:45:00'),
(5, 6, 11, 'B26041219000001', '2026-04-12 19:00:00', '2026-04-12 21:00:00', 48.00, 'Paid', 'Confirmed', '2026-03-14 10:00:00', '2026-03-14 10:00:00'),
(6, 7, 51, 'B26041511000001', '2026-04-15 11:00:00', '2026-04-15 13:00:00', 44.00, 'Paid', 'Confirmed', '2026-03-15 00:30:00', '2026-03-15 00:30:00'),
(7, 8, 99, 'B26041809300001', '2026-04-18 09:30:00', '2026-04-18 11:30:00', 56.00, 'Paid', 'Confirmed', '2026-03-16 05:10:00', '2026-03-16 05:10:00'),
(8, 9, 23, 'B26042219000001', '2026-04-22 19:00:00', '2026-04-22 20:00:00', 16.00, 'Paid', 'Confirmed', '2026-03-17 02:00:00', '2026-03-17 02:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coach_profile`
--

CREATE TABLE `coach_profile` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `state_id` bigint(20) UNSIGNED NOT NULL,
  `bio` text NOT NULL,
  `exp_year` int(11) NOT NULL,
  `cert` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coach_profile`
--

INSERT INTO `coach_profile` (`user_id`, `state_id`, `bio`, `exp_year`, `cert`, `status`, `created_at`, `updated_at`) VALUES
(7, 1, 'Experienced coach specializing in singles technique for intermediate players.', 5, 'cert_carl.pdf', 'Approved', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(8, 12, 'Former national player, focusing on doubles strategy and footwork drills.', 8, 'cert_diana.pdf', 'Approved', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(11, 14, 'All-round coach for beginner to advanced levels. Also a certified tournament organizer.', 10, 'cert_mike.pdf', 'Approved', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `court`
--

CREATE TABLE `court` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `venue_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('Available','Maintenance','Terminated') NOT NULL DEFAULT 'Available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `court`
--

INSERT INTO `court` (`id`, `venue_id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Court 1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 1, 'Court 2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 1, 'Court 3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 1, 'Court 4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 1, 'Court 5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(6, 1, 'Court 6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(7, 1, 'Court 7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(8, 1, 'Court 8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(9, 1, 'Court 9', 'Maintenance', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(10, 1, 'Court 10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(11, 2, 'Court A1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(12, 2, 'Court A2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(13, 2, 'Court A3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(14, 2, 'Court A4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(15, 2, 'Court A5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(16, 2, 'Court A6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(17, 2, 'Court B1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(18, 2, 'Court B2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(19, 2, 'Court B3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(20, 2, 'Court B4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(21, 2, 'Court B5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(22, 2, 'Court B6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(23, 3, 'Court 1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(24, 3, 'Court 2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(25, 3, 'Court 3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(26, 3, 'Court 4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(27, 3, 'Court 5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(28, 3, 'Court 6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(29, 3, 'Court 7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(30, 3, 'Court 8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(31, 3, 'Court 9', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(32, 3, 'Court 10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(33, 4, 'P-01', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(34, 4, 'P-02', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(35, 4, 'P-03', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(36, 4, 'P-04', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(37, 4, 'P-05', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(38, 4, 'P-06', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(39, 4, 'P-07', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(40, 4, 'P-08', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(41, 4, 'P-09', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(42, 4, 'P-10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(43, 4, 'P-11', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(44, 4, 'P-12', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(45, 4, 'P-13', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(46, 4, 'P-14', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(47, 4, 'P-15', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(48, 5, 'Elite 1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(49, 5, 'Elite 2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(50, 5, 'Elite 3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(51, 5, 'Elite 4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(52, 5, 'Elite 5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(53, 5, 'Elite 6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(54, 5, 'Elite 7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(55, 5, 'Elite 8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(56, 5, 'Elite 9', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(57, 5, 'Elite 10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(58, 6, 'Court 1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(59, 6, 'Court 2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(60, 6, 'Court 3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(61, 6, 'Court 4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(62, 6, 'Court 5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(63, 6, 'Court 6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(64, 6, 'Court 7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(65, 6, 'Court 8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(66, 6, 'Court 9', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(67, 6, 'Court 10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(68, 7, 'PSH-1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(69, 7, 'PSH-2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(70, 7, 'PSH-3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(71, 7, 'PSH-4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(72, 7, 'PSH-5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(73, 7, 'PSH-6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(74, 7, 'PSH-7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(75, 7, 'PSH-8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(76, 7, 'PSH-9', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(77, 7, 'PSH-10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(78, 7, 'PSH-11', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(79, 7, 'PSH-12', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(80, 7, 'PSH-13', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(81, 7, 'PSH-14', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(82, 7, 'PSH-15', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(83, 7, 'PSH-16', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(84, 8, 'PSA-01', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(85, 8, 'PSA-02', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(86, 8, 'PSA-03', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(87, 8, 'PSA-04', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(88, 8, 'PSA-05', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(89, 8, 'PSA-06', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(90, 8, 'PSA-07', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(91, 8, 'PSA-08', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(92, 8, 'PSA-09', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(93, 8, 'PSA-10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(94, 9, 'Court 1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(95, 9, 'Court 2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(96, 9, 'Court 3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(97, 9, 'Court 4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(98, 9, 'Court 5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(99, 9, 'Court 6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(100, 9, 'Court 7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(101, 9, 'Court 8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(102, 9, 'Court 9', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(103, 9, 'Court 10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(104, 10, 'Court 1', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(105, 10, 'Court 2', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(106, 10, 'Court 3', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(107, 10, 'Court 4', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(108, 10, 'Court 5', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(109, 10, 'Court 6', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(110, 10, 'Court 7', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(111, 10, 'Court 8', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(112, 10, 'Court 9', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(113, 10, 'Court 10', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(114, 10, 'VIP Court', 'Available', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_member`
--

CREATE TABLE `group_member` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trainee_group_id` bigint(20) UNSIGNED NOT NULL,
  `trainee_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('Active','Terminated') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `group_member`
--

INSERT INTO `group_member` (`id`, `trainee_group_id`, `trainee_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 15, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(2, 1, 16, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(3, 1, 17, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(4, 2, 18, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(5, 2, 19, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(6, 2, 20, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(7, 3, 21, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(8, 3, 22, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(9, 3, 23, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(10, 4, 24, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(11, 4, 25, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(12, 4, 26, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(13, 5, 27, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(14, 5, 28, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(15, 5, 29, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(16, 6, 30, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(17, 6, 31, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(18, 6, 32, 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '0001_01_01_000002_create_jobs_table', 1),
(3, '2025_10_23_114358_create_personal_access_tokens_table', 1),
(4, '2025_10_23_122839_create_all_tables', 1),
(5, '2025_11_06_144727_create_sessions_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `organiser_pass`
--

CREATE TABLE `organiser_pass` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `purchase_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organiser_pass`
--

INSERT INTO `organiser_pass` (`user_id`, `amount`, `purchase_date`, `created_at`, `updated_at`) VALUES
(9, 40.00, '2025-02-01', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(10, 40.00, '2025-02-15', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(11, 40.00, '2025-03-01', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `owner_profile`
--

CREATE TABLE `owner_profile` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `business_reg_no` varchar(255) NOT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `owner_profile`
--

INSERT INTO `owner_profile` (`user_id`, `company_name`, `business_reg_no`, `status`, `created_at`, `updated_at`) VALUES
(12, 'Arena Master Sdn Bhd', '202501001212', 'Approved', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(13, 'Court King Enterprise', '202501001313', 'Approved', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(14, 'Pro Shuttle Sports', '202501001414', 'Approved', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 7, 'api-token', '1a98b05e83a674a34eaf5e2987774b7db07d30cd209de244272741ad01ea6f70', '[\"*\"]', '2025-11-19 18:11:17', NULL, '2025-11-19 18:07:38', '2025-11-19 18:11:17'),
(2, 'App\\Models\\User', 2, 'api-token', '60aff37bdd3c9b14d4b7cdfb62a08a3d400213645676c29236abe2aea3dfd9eb', '[\"*\"]', '2025-11-20 03:25:08', NULL, '2025-11-20 03:24:21', '2025-11-20 03:25:08');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_rule`
--

CREATE TABLE `pricing_rule` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `venue_id` bigint(20) UNSIGNED NOT NULL,
  `day_type` enum('Weekday','Weekend') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pricing_rule`
--

INSERT INTO `pricing_rule` (`id`, `venue_id`, `day_type`, `start_time`, `end_time`, `price`, `created_at`, `updated_at`) VALUES
(1, 1, 'Weekday', '08:00:00', '23:00:00', 18.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 1, 'Weekend', '08:00:00', '23:00:00', 25.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 2, 'Weekday', '09:00:00', '23:30:00', 17.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 2, 'Weekend', '09:00:00', '23:30:00', 24.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 3, 'Weekday', '08:30:00', '22:30:00', 16.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(6, 3, 'Weekend', '08:30:00', '22:30:00', 22.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(7, 4, 'Weekday', '07:00:00', '18:00:00', 25.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(8, 4, 'Weekday', '18:00:00', '23:59:00', 35.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(9, 4, 'Weekend', '07:00:00', '23:59:00', 35.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(10, 5, 'Weekday', '10:00:00', '22:00:00', 22.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(11, 5, 'Weekend', '10:00:00', '22:00:00', 30.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(12, 6, 'Weekday', '09:00:00', '01:00:00', 20.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(13, 6, 'Weekend', '09:00:00', '01:00:00', 28.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(14, 7, 'Weekday', '08:00:00', '23:00:00', 19.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(15, 7, 'Weekend', '08:00:00', '23:00:00', 26.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(16, 8, 'Weekday', '08:00:00', '23:00:00', 19.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(17, 8, 'Weekend', '08:00:00', '23:00:00', 26.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(18, 9, 'Weekday', '09:30:00', '22:30:00', 21.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(19, 9, 'Weekend', '09:30:00', '22:30:00', 28.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(20, 10, 'Weekday', '09:00:00', '23:30:00', 15.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(21, 10, 'Weekend', '09:00:00', '23:30:00', 22.00, '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_attendance`
--

CREATE TABLE `session_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `training_session_id` bigint(20) UNSIGNED NOT NULL,
  `group_member_id` bigint(20) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('Pending','Present','Absent') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `session_attendance`
--

INSERT INTO `session_attendance` (`id`, `training_session_id`, `group_member_id`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(2, 1, 2, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(3, 1, 3, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(4, 2, 1, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(5, 2, 2, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(6, 2, 3, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(7, 3, 1, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(8, 3, 2, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(9, 3, 3, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(10, 4, 4, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(11, 4, 5, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(12, 4, 6, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(13, 5, 4, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(14, 5, 5, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(15, 5, 6, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(16, 6, 4, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(17, 6, 5, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(18, 6, 6, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(19, 7, 7, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(20, 7, 8, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(21, 7, 9, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(22, 8, 7, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(23, 8, 8, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(24, 8, 9, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(25, 9, 7, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(26, 9, 8, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(27, 9, 9, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(28, 10, 10, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(29, 10, 11, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(30, 10, 12, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(31, 11, 10, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(32, 11, 11, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(33, 11, 12, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(34, 12, 10, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(35, 12, 11, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(36, 12, 12, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(37, 13, 13, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(38, 13, 14, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(39, 13, 15, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(40, 14, 13, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(41, 14, 14, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(42, 14, 15, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(43, 15, 13, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(44, 15, 14, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(45, 15, 15, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(46, 16, 16, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(47, 16, 17, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(48, 16, 18, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(49, 17, 16, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(50, 17, 17, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(51, 17, 18, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(52, 18, 16, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(53, 18, 17, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(54, 18, 18, NULL, 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `skill_level`
--

CREATE TABLE `skill_level` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `skill_level`
--

INSERT INTO `skill_level` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'All Levels', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 'Beginner', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 'Intermediate', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 'Advanced', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `state`
--

CREATE TABLE `state` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `state`
--

INSERT INTO `state` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Johor', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 'Kedah', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 'Kelantan', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 'Malacca', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 'Negeri Sembilan', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(6, 'Pahang', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(7, 'Penang', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(8, 'Perak', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(9, 'Perlis', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(10, 'Sabah', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(11, 'Sarawak', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(12, 'Selangor', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(13, 'Terengganu', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(14, 'Wilayah Persekutuan Kuala Lumpur', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(15, 'Wilayah Persekutuan Labuan', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(16, 'Wilayah Persekutuan Putrajaya', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `tournament`
--

CREATE TABLE `tournament` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organiser_id` bigint(20) UNSIGNED NOT NULL,
  `state_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `venue_address` text NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `deadline` date NOT NULL,
  `description` text NOT NULL,
  `prize` text NOT NULL,
  `rule` text NOT NULL,
  `result` text DEFAULT NULL,
  `status` enum('Upcoming','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Upcoming',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tournament`
--

INSERT INTO `tournament` (`id`, `organiser_id`, `state_id`, `name`, `photo`, `venue_address`, `start_date`, `end_date`, `deadline`, `description`, `prize`, `rule`, `result`, `status`, `created_at`, `updated_at`) VALUES
(1, 9, 12, 'Owen\'s Open 2026', 'owens_open_2026.jpg', 'Arena Master Central, 123, Jalan Harmoni, 47100 Puchong, Selangor', '2026-08-15', '2026-08-17', '2026-07-31', 'The first annual Owen\'s Open! A tournament for all passionate players in the Klang Valley. Come and test your skills.', 'Men\'s Singles Champion: RM1,000\nMen\'s Doubles Champion: RM1,500\nMixed Doubles Champion: RM1,500.\nMedals for all finalists.', '1. All players must wear appropriate non-marking court shoes.\n2. Shuttles will be provided.\n3. The umpire\'s decision is final.', NULL, 'Upcoming', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 10, 12, 'Olivia\'s Badminton Fiesta 2026', 'olivias_fiesta_2026.jpg', 'Pro Shuttle Hub, 77, Persiaran Sukan, 40150 Shah Alam, Selangor', '2026-09-20', '2026-09-22', '2026-09-05', 'Join us for a weekend of fun, competition, and badminton! Olivia\'s Badminton Fiesta is open to all categories and aims to bring the community together.', 'Total prize pool of RM10,000 to be distributed among all category winners and runners-up. Trophies and hampers for all winners.', '1. Standard BWF rules apply.\n2. Players can only participate in a maximum of two categories.\n3. Please report to the tournament desk 30 minutes before your scheduled match.', NULL, 'Upcoming', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 11, 14, 'Mike\'s Grand Challenge 2026', 'mikes_challenge_2026.jpg', 'Court King Premier, 101, Jalan Raja, 50350 Kuala Lumpur', '2026-01-10', '2026-01-11', '2025-12-20', 'Start the new year with a challenge! A high-stakes tournament focused on the women\'s categories, designed to showcase top female talent.', 'Women\'s Singles Champion: RM2,000\nWomen\'s Doubles Champion: RM3,000.\nExclusive merchandise for all participants.', '1. This tournament is exclusively for female players.\n2. All matches will be played using the 21-point rally system.\n3. Players must be present for the prize-giving ceremony.', NULL, 'Upcoming', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `tournament_category`
--

CREATE TABLE `tournament_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tournament_category`
--

INSERT INTO `tournament_category` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Men\'s Singles', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 'Women\'s Singles', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 'Men\'s Doubles', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 'Women\'s Doubles', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 'Mixed Doubles', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `tournament_registration`
--

CREATE TABLE `tournament_registration` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tournament_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `ec_phone_no` varchar(255) NOT NULL,
  `payment_status` enum('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `status` enum('Pending','Approved','Rejected','Cancelled') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tournament_registration`
--

INSERT INTO `tournament_registration` (`id`, `user_id`, `partner_id`, `tournament_id`, `category_id`, `ec_phone_no`, `payment_status`, `status`, `created_at`, `updated_at`) VALUES
(1, 15, NULL, 1, 1, '011-10001515', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(2, 16, NULL, 1, 1, '011-10001616', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(3, 17, 18, 1, 3, '011-10001717', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(4, 19, 20, 1, 3, '011-10001919', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(5, 21, 25, 1, 5, '011-10002121', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(6, 22, 26, 1, 5, '011-10002222', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(7, 23, NULL, 2, 1, '011-10002323', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(8, 24, NULL, 2, 1, '011-10002424', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(9, 27, NULL, 2, 2, '011-20002727', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(10, 28, NULL, 2, 2, '011-20002828', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(11, 15, 16, 2, 3, '011-30001515', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(12, 17, 18, 2, 3, '011-30001717', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(13, 29, 30, 2, 4, '011-20002929', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(14, 31, 32, 2, 4, '011-20003131', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(15, 19, 33, 2, 5, '011-30001919', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(16, 20, 34, 2, 5, '011-30002020', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(17, 25, NULL, 3, 2, '011-40002525', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(18, 26, NULL, 3, 2, '011-40002626', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(19, 27, 28, 3, 4, '011-40002727', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(20, 29, 30, 3, 4, '011-40002929', 'Unpaid', 'Pending', '2025-11-19 18:06:31', '2025-11-19 18:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `tournament_selected_category`
--

CREATE TABLE `tournament_selected_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tournament_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `entry_fee` decimal(8,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tournament_selected_category`
--

INSERT INTO `tournament_selected_category` (`id`, `tournament_id`, `category_id`, `entry_fee`, `created_at`) VALUES
(1, 1, 1, 50.00, '2025-11-03 16:00:00'),
(2, 1, 3, 80.00, '2025-11-03 16:00:00'),
(3, 1, 5, 80.00, '2025-11-03 16:00:00'),
(4, 2, 1, 55.00, '2025-11-03 16:00:00'),
(5, 2, 2, 55.00, '2025-11-03 16:00:00'),
(6, 2, 3, 90.00, '2025-11-03 16:00:00'),
(7, 2, 4, 90.00, '2025-11-03 16:00:00'),
(8, 2, 5, 90.00, '2025-11-03 16:00:00'),
(9, 3, 2, 60.00, '2025-11-03 16:00:00'),
(10, 3, 4, 100.00, '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `trainee_group`
--

CREATE TABLE `trainee_group` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `coach_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Terminated') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainee_group`
--

INSERT INTO `trainee_group` (`id`, `coach_id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 7, 'Carl\'s Junior Squad', 'A group for beginner to intermediate junior players focusing on fundamentals.', 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(2, 7, 'Carl\'s Elite Team', 'An advanced group for competitive players focusing on strategy and match play.', 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(3, 8, 'Diana\'s Doubles Drills', 'Intermediate group dedicated to improving doubles rotation and communication.', 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(4, 8, 'Diana\'s Power Players', 'Focuses on building stamina, power smashes, and aggressive play for all levels.', 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(5, 11, 'Mike\'s Weekend Warriors', 'A casual, all-levels group for players who want to improve their game on weekends.', 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(6, 11, 'Mike\'s Footwork Masters', 'A specialized group to master all aspects of badminton footwork.', 'Active', '2025-11-19 18:06:31', '2025-11-19 18:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `training_session`
--

CREATE TABLE `training_session` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trainee_group_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `status` enum('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `training_session`
--

INSERT INTO `training_session` (`id`, `trainee_group_id`, `name`, `description`, `start_datetime`, `end_datetime`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Basic Grip & Stance', 'Correcting the fundamental grips and ready stance.', '2026-01-10 18:00:00', '2026-01-10 20:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(2, 1, 'Net Play Intro', 'Introduction to net shots and net lifts.', '2026-01-17 18:00:00', '2026-01-17 20:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(3, 1, 'Basic Footwork', 'Covering the 6 corners of the court.', '2026-01-24 18:00:00', '2026-01-24 20:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(4, 2, 'Deceptive Shots', 'Practicing sliced drops and reverse slices.', '2026-01-11 19:00:00', '2026-01-11 21:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(5, 2, 'Match Simulation', 'Playing full sets with coaching feedback.', '2026-01-18 19:00:00', '2026-01-18 21:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(6, 2, 'High-Intensity Drills', 'Fast-paced multi-shuttle drills.', '2026-01-25 19:00:00', '2026-01-25 21:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(7, 3, 'Rotation Strategy', 'Front-back and side-by-side rotation practice.', '2026-02-05 20:00:00', '2026-02-05 22:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(8, 3, 'Service and Return', 'Perfecting the low serve and aggressive returns.', '2026-02-12 20:00:00', '2026-02-12 22:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(9, 3, 'Defense Drills', 'Practicing defensive lifts and blocks against smashes.', '2026-02-19 20:00:00', '2026-02-19 22:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(10, 4, 'Jump Smash Technique', 'Improving timing and power for jump smashes.', '2026-02-06 18:30:00', '2026-02-06 20:30:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(11, 4, 'Full Court Clears', 'Drills to consistently hit deep, high clears.', '2026-02-13 18:30:00', '2026-02-13 20:30:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(12, 4, 'Physical Conditioning', 'On-court exercises to build explosive strength.', '2026-02-20 18:30:00', '2026-02-20 20:30:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(13, 5, 'All-Round Practice', 'A mix of drills covering all basic shots.', '2026-01-10 10:00:00', '2026-01-10 12:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(14, 5, 'Friendly Matches', 'Organized friendly games with feedback.', '2026-01-17 10:00:00', '2026-01-17 12:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(15, 5, 'Q&A Session', 'An open session to ask questions and get personalized tips.', '2026-01-24 10:00:00', '2026-01-24 12:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(16, 6, 'Split Step and Recovery', 'Mastering the split step for faster reactions.', '2026-01-15 19:30:00', '2026-01-15 21:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(17, 6, 'Chassé and Cross-Step', 'Drills for efficient movement to the sides.', '2026-01-22 19:30:00', '2026-01-22 21:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(18, 6, 'Shadow Movement', 'Perfecting court coverage without a shuttle.', '2026-01-29 19:30:00', '2026-01-29 21:00:00', 'Scheduled', '2025-11-19 18:06:31', '2025-11-19 18:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` enum('M','F') NOT NULL,
  `date_of_birth` date NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone_no` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `role` enum('Player','Admin','Owner') NOT NULL DEFAULT 'Player',
  `is_coach` tinyint(1) NOT NULL DEFAULT 0,
  `is_organiser` tinyint(1) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive','Terminated') NOT NULL DEFAULT 'Active',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `user_id`, `name`, `gender`, `date_of_birth`, `email`, `email_verified_at`, `password`, `phone_no`, `photo`, `role`, `is_coach`, `is_organiser`, `points`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'A2501010001', 'Root Admin', 'M', '1990-01-01', 'admin@example.com', NULL, '$2y$12$tEOel2TSVkIxZd8oNc.Aq.rwu8G8OmsJyVW0WMeI7QLHnvqTcKHDO', '010-0000001', NULL, 'Admin', 0, 0, 0, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 'P2501020001', 'John Doe', 'M', '1998-05-15', 'john.doe@example.com', NULL, '$2y$12$iEJSpuCKCondjk89uTK5seKgEDHrMqTr40wXV4N1S0b.ylWqQ.ELu', '012-1112222', NULL, 'Player', 0, 0, 150, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 'P2501030001', 'Jane Smith', 'F', '2001-02-20', 'jane.smith@example.com', NULL, '$2y$12$ZlwPG69hNcwGe2JxONQi1OaUhJa6NpBi.7t1Uln.4JzmTQdwJ9GMy', '012-3334444', NULL, 'Player', 0, 0, 200, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 'P2501040001', 'Peter Jones', 'M', '1999-11-30', 'peter.jones@example.com', NULL, '$2y$12$afidBiN1HbChGv/fW66RCuZBNqDL2Vp3GmNc9GgIby6QokpWKO/ey', '012-5556666', NULL, 'Player', 0, 0, 50, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 'P2501050001', 'Mary Williams', 'F', '2002-07-12', 'mary.w@example.com', NULL, '$2y$12$.JRJgeNMJfNlRAE8TLExde8Zw35MDDn9bpwR0Yhw.v0prGEH7mEcm', '012-7778888', NULL, 'Player', 0, 0, 300, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(6, 'P2501060001', 'David Brown', 'M', '2000-09-05', 'david.b@example.com', NULL, '$2y$12$NplQCTBzGLxEy.2yf1C0n.PNVHriiurjocLKcIZWeC1yRSKAjxkgi', '012-9990000', NULL, 'Player', 0, 0, 120, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(7, 'P2501070001', 'Coach Carl', 'M', '1995-03-10', 'carl.c@example.com', NULL, '$2y$12$gkvUanUwP9CnqIrDvySjReE2qHEPp/.Np2RSq9oVJIfdCRDTBREH.', '018-1234567', NULL, 'Player', 1, 0, 500, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(8, 'P2501080001', 'Coach Diana', 'F', '1992-08-25', 'diana.d@example.com', NULL, '$2y$12$ySnQ6NMLK034l3.jJuFQZ.eyjICNWzlpGElcyqM0WYYGvs4wUhlhK', '018-7654321', NULL, 'Player', 1, 0, 650, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(9, 'P2501090001', 'Organizer Owen', 'M', '1993-06-18', 'owen.o@example.com', NULL, '$2y$12$GtjI4bMrxZLGqILjsIHAJuGo4nNNk6FNVd3wW8zuTz2MHG/t.2hYq', '019-1122334', NULL, 'Player', 0, 1, 400, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(10, 'P2501100001', 'Organizer Olivia', 'F', '1996-12-01', 'olivia.o@example.com', NULL, '$2y$12$eUDIl.rOZE5jHa.YEIQM7uK92jblcRwMJMalQTK7NiKJ3Flzyiuem', '019-4433221', NULL, 'Player', 0, 1, 350, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(11, 'P2501110001', 'Multi-role Mike', 'M', '1991-04-14', 'mike.m@example.com', NULL, '$2y$12$/dwtMotUl1cp8tS6n5mu0.KnmOP.pi3oghWqBTYeWeHcmBGMMFWHW', '016-5551111', NULL, 'Player', 1, 1, 1000, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(12, 'O2501120001', 'Arena Master', 'M', '1985-10-20', 'master@arena.com', NULL, '$2y$12$Kp/E2y2ATSVYBJjeWL6B5OwSR5XTCT9VNBrM3jZmW32ktACGGGNQC', '03-12341111', NULL, 'Owner', 0, 0, 0, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(13, 'O2501130001', 'Court King', 'M', '1988-03-15', 'king@courts.com', NULL, '$2y$12$2RUbh.INI7Yx182r1Y6hYOYmwQHwhWfluH.VMwYMiEZyTf1kuj06C', '03-56782222', NULL, 'Owner', 0, 0, 0, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(14, 'O2501140001', 'Pro Shuttle', 'F', '1992-07-25', 'manager@proshuttle.com', NULL, '$2y$12$3pv3e4cypGx9aN9qYlBpmOKPHc4yMX.GkLp.wwD/T9InmVqZQX/oe', '03-98763333', NULL, 'Owner', 0, 0, 0, 'Active', NULL, '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(15, 'P2511190001', 'Player 1', 'M', '1998-05-15', 'player1@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000001', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(16, 'P2511190002', 'Player 2', 'M', '1998-05-15', 'player2@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000002', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(17, 'P2511190003', 'Player 3', 'M', '1998-05-15', 'player3@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000003', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(18, 'P2511190004', 'Player 4', 'M', '1998-05-15', 'player4@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000004', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(19, 'P2511190005', 'Player 5', 'M', '1998-05-15', 'player5@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000005', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(20, 'P2511190006', 'Player 6', 'M', '1998-05-15', 'player6@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000006', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(21, 'P2511190007', 'Player 7', 'M', '1998-05-15', 'player7@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000007', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(22, 'P2511190008', 'Player 8', 'M', '1998-05-15', 'player8@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000008', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(23, 'P2511190009', 'Player 9', 'M', '1998-05-15', 'player9@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000009', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(24, 'P2511190010', 'Player 10', 'M', '1998-05-15', 'player10@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000010', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(25, 'P2511190011', 'Player 11', 'F', '1998-05-15', 'player11@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000011', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(26, 'P2511190012', 'Player 12', 'F', '1998-05-15', 'player12@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000012', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(27, 'P2511190013', 'Player 13', 'F', '1998-05-15', 'player13@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000013', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(28, 'P2511190014', 'Player 14', 'F', '1998-05-15', 'player14@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000014', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(29, 'P2511190015', 'Player 15', 'F', '1998-05-15', 'player15@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000015', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(30, 'P2511190016', 'Player 16', 'F', '1998-05-15', 'player16@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000016', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(31, 'P2511190017', 'Player 17', 'F', '1998-05-15', 'player17@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000017', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(32, 'P2511190018', 'Player 18', 'F', '1998-05-15', 'player18@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000018', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(33, 'P2511190019', 'Player 19', 'F', '1998-05-15', 'player19@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000019', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31'),
(34, 'P2511190020', 'Player 20', 'F', '1998-05-15', 'player20@example.com', NULL, '$2y$10$NazQA5IS42lFn73TUC0D8OSiUHHDO..rJcez4UjpCSTEQDQX2cSCW', '018-0000020', NULL, 'Player', 0, 0, 0, 'Active', NULL, '2025-11-19 18:06:31', '2025-11-19 18:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `venue`
--

CREATE TABLE `venue` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `state_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `opening_time` time NOT NULL,
  `closing_time` time NOT NULL,
  `phone_no` varchar(255) NOT NULL,
  `apply_status` enum('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending',
  `status` enum('Active','Inactive','Terminated') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `venue`
--

INSERT INTO `venue` (`id`, `owner_id`, `state_id`, `name`, `address`, `opening_time`, `closing_time`, `phone_no`, `apply_status`, `status`, `created_at`, `updated_at`) VALUES
(1, 12, 6, 'Arena Master Central', '123, Jalan Harmoni, 28700 Bentong, Pahang', '08:00:00', '23:00:00', '03-80001111', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 12, 7, 'Arena Master North', '456, Jalan Utara, 47122 George Town, Penang', '09:00:00', '23:30:00', '03-80002222', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 12, 8, 'Arena Master South', '789, Jalan Selatan, 30010 Ipoh, Perak', '08:30:00', '22:30:00', '03-80003333', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 13, 9, 'Court King Premier', '101, Jalan Raja, 01502 Kangar, Perlis', '07:00:00', '00:00:00', '03-90004444', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 13, 10, 'Court King Elite', '202, Jalan Permaisuri, 56000 Cheras, Sabah', '10:00:00', '22:00:00', '03-90005555', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(6, 13, 11, 'Court King Express', '303, Jalan Cepat, 93000 Kuching, Sarawak', '09:00:00', '01:00:00', '03-90006666', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(7, 14, 12, 'Pro Shuttle Hub', '77, Persiaran Sukan, 40150 Shah Alam, Selangor', '08:00:00', '23:00:00', '03-70007777', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(8, 14, 14, 'Pro Shuttle Arena', '88, Lorong Juara, 50000, Kuala Lumpur', '08:00:00', '23:00:00', '03-70008888', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(9, 14, 14, 'Pro Shuttle Damansara', '99, Jalan Damai, 50000, Kuala Lumpur', '09:30:00', '22:30:00', '03-70009999', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(10, 14, 14, 'Pro Shuttle Klang', '111, Jalan Bakti, 50000, Kuala Lumpur', '09:00:00', '23:30:00', '03-70001010', 'Approved', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `venue_photo`
--

CREATE TABLE `venue_photo` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `venue_id` bigint(20) UNSIGNED NOT NULL,
  `photo` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `venue_photo`
--

INSERT INTO `venue_photo` (`id`, `venue_id`, `photo`, `created_at`) VALUES
(1, 1, 'amc_1.jpg', '2025-11-03 16:00:00'),
(2, 1, 'amc_2.jpg', '2025-11-03 16:00:00'),
(3, 1, 'amc_3.jpg', '2025-11-03 16:00:00'),
(4, 2, 'amn_1.jpg', '2025-11-03 16:00:00'),
(5, 2, 'amn_2.jpg', '2025-11-03 16:00:00'),
(6, 3, 'ams_1.jpg', '2025-11-03 16:00:00'),
(7, 3, 'ams_2.jpg', '2025-11-03 16:00:00'),
(8, 4, 'ckp_1.jpg', '2025-11-03 16:00:00'),
(9, 4, 'ckp_2.jpg', '2025-11-03 16:00:00'),
(10, 4, 'ckp_3.jpg', '2025-11-03 16:00:00'),
(11, 5, 'cke_1.jpg', '2025-11-03 16:00:00'),
(12, 5, 'cke_2.jpg', '2025-11-03 16:00:00'),
(13, 6, 'ckx_1.jpg', '2025-11-03 16:00:00'),
(14, 6, 'ckx_2.jpg', '2025-11-03 16:00:00'),
(15, 7, 'psh_1.jpg', '2025-11-03 16:00:00'),
(16, 7, 'psh_2.jpg', '2025-11-03 16:00:00'),
(17, 8, 'psa_1.jpg', '2025-11-03 16:00:00'),
(18, 8, 'psa_2.jpg', '2025-11-03 16:00:00'),
(19, 8, 'psa_3.jpg', '2025-11-03 16:00:00'),
(20, 9, 'pskl1_1.jpg', '2025-11-03 16:00:00'),
(21, 9, 'pskl1_2.jpg', '2025-11-03 16:00:00'),
(22, 10, 'pskl2_1.jpg', '2025-11-03 16:00:00'),
(23, 10, 'pskl2_2.jpg', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `venue_review`
--

CREATE TABLE `venue_review` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `venue_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('Active','Terminated') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `venue_review`
--

INSERT INTO `venue_review` (`id`, `user_id`, `venue_id`, `rating`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 5, 'Excellent courts! The lighting is great and the place is very clean. Staff were friendly too. Will definitely come back.', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(2, 3, 1, 5, 'One of the best courts in KL. The floor grip is perfect and there is plenty of space between courts. A bit pricey, but worth it for a serious game.', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(3, 7, 1, 4, 'As a coach, I find the facilities here very suitable for training sessions. Courts are well-maintained. Could use a bit more seating for spectators, but overall a great venue.', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(4, 9, 1, 4, 'Good place for a late-night game since they close after midnight. The booking process was smooth. Some courts are a little worn but still very playable.', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(5, 10, 1, 5, 'Really love the atmosphere here. It\'s clean, modern, and not too crowded. The online booking system is easy to use. Highly recommended!', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00'),
(6, 11, 1, 4, 'A solid choice for players in the Klang area. Ample parking available. The court mats are in good condition. Hope they can add a small pro-shop soon.', 'Active', '2025-11-03 16:00:00', '2025-11-03 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `voucher`
--

CREATE TABLE `voucher` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `discount_value` decimal(8,2) NOT NULL,
  `point_cost` int(11) NOT NULL,
  `validity` int(11) NOT NULL,
  `status` enum('Active','Inactive','Terminated') NOT NULL DEFAULT 'Inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `voucher`
--

INSERT INTO `voucher` (`id`, `code`, `description`, `discount_value`, `point_cost`, `validity`, `status`, `created_at`, `updated_at`) VALUES
(1, 'RM5OFF', 'RM5 Off', 5.00, 500, 30, 'Active', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(2, 'RM10OFF', 'RM10 Off', 10.00, 1000, 30, 'Active', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(3, 'RM15OFF', 'RM15 Off', 15.00, 1500, 30, 'Active', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(4, 'RM30OFF', 'RM30 Off', 30.00, 3000, 30, 'Active', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(5, 'RM50OFF', 'RM50 Off', 50.00, 5000, 30, 'Active', '2025-11-11 16:00:00', '2025-11-11 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `voucher_history`
--

CREATE TABLE `voucher_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `voucher_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `status` enum('Available','Used','Expired') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `voucher_history`
--

INSERT INTO `voucher_history` (`id`, `user_id`, `voucher_id`, `booking_id`, `expiry_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(2, 2, 2, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(3, 3, 2, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(4, 3, 3, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(5, 4, 1, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(6, 4, 4, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(7, 5, 3, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(8, 5, 5, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(9, 6, 1, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(10, 6, 2, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(11, 7, 2, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(12, 7, 4, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(13, 8, 1, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(14, 8, 3, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(15, 9, 2, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(16, 9, 5, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(17, 10, 1, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(18, 10, 4, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(19, 11, 3, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00'),
(20, 11, 5, NULL, '2025-12-12', 'Available', '2025-11-11 16:00:00', '2025-11-11 16:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_user_id_foreign` (`user_id`),
  ADD KEY `activity_booking_id_foreign` (`booking_id`),
  ADD KEY `activity_skill_level_id_foreign` (`skill_level_id`);

--
-- Indexes for table `activity_participant`
--
ALTER TABLE `activity_participant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_participant_user_id_foreign` (`user_id`),
  ADD KEY `activity_participant_activity_id_foreign` (`activity_id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_booking_id_unique` (`booking_id`),
  ADD KEY `booking_user_id_foreign` (`user_id`),
  ADD KEY `booking_court_id_foreign` (`court_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `coach_profile`
--
ALTER TABLE `coach_profile`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `coach_profile_state_id_foreign` (`state_id`);

--
-- Indexes for table `court`
--
ALTER TABLE `court`
  ADD PRIMARY KEY (`id`),
  ADD KEY `court_venue_id_foreign` (`venue_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `group_member`
--
ALTER TABLE `group_member`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_member_trainee_group_id_foreign` (`trainee_group_id`),
  ADD KEY `group_member_trainee_id_foreign` (`trainee_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organiser_pass`
--
ALTER TABLE `organiser_pass`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `owner_profile`
--
ALTER TABLE `owner_profile`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `pricing_rule`
--
ALTER TABLE `pricing_rule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pricing_rule_venue_id_foreign` (`venue_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `session_attendance`
--
ALTER TABLE `session_attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_attendance_training_session_id_foreign` (`training_session_id`),
  ADD KEY `session_attendance_group_member_id_foreign` (`group_member_id`);

--
-- Indexes for table `skill_level`
--
ALTER TABLE `skill_level`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `state`
--
ALTER TABLE `state`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tournament`
--
ALTER TABLE `tournament`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_organiser_id_foreign` (`organiser_id`),
  ADD KEY `tournament_state_id_foreign` (`state_id`);

--
-- Indexes for table `tournament_category`
--
ALTER TABLE `tournament_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tournament_registration`
--
ALTER TABLE `tournament_registration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_registration_user_id_foreign` (`user_id`),
  ADD KEY `tournament_registration_partner_id_foreign` (`partner_id`),
  ADD KEY `tournament_registration_tournament_id_foreign` (`tournament_id`),
  ADD KEY `tournament_registration_category_id_foreign` (`category_id`);

--
-- Indexes for table `tournament_selected_category`
--
ALTER TABLE `tournament_selected_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_selected_category_tournament_id_foreign` (`tournament_id`),
  ADD KEY `tournament_selected_category_category_id_foreign` (`category_id`);

--
-- Indexes for table `trainee_group`
--
ALTER TABLE `trainee_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_group_coach_id_foreign` (`coach_id`);

--
-- Indexes for table `training_session`
--
ALTER TABLE `training_session`
  ADD PRIMARY KEY (`id`),
  ADD KEY `training_session_trainee_group_id_foreign` (`trainee_group_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `user_email_unique` (`email`);

--
-- Indexes for table `venue`
--
ALTER TABLE `venue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venue_owner_id_foreign` (`owner_id`),
  ADD KEY `venue_state_id_foreign` (`state_id`);

--
-- Indexes for table `venue_photo`
--
ALTER TABLE `venue_photo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venue_photo_venue_id_foreign` (`venue_id`);

--
-- Indexes for table `venue_review`
--
ALTER TABLE `venue_review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venue_review_user_id_foreign` (`user_id`),
  ADD KEY `venue_review_venue_id_foreign` (`venue_id`);

--
-- Indexes for table `voucher`
--
ALTER TABLE `voucher`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `voucher_code_unique` (`code`);

--
-- Indexes for table `voucher_history`
--
ALTER TABLE `voucher_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `voucher_history_user_id_foreign` (`user_id`),
  ADD KEY `voucher_history_voucher_id_foreign` (`voucher_id`),
  ADD KEY `voucher_history_booking_id_foreign` (`booking_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity`
--
ALTER TABLE `activity`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `activity_participant`
--
ALTER TABLE `activity_participant`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `court`
--
ALTER TABLE `court`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_member`
--
ALTER TABLE `group_member`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pricing_rule`
--
ALTER TABLE `pricing_rule`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `session_attendance`
--
ALTER TABLE `session_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `skill_level`
--
ALTER TABLE `skill_level`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `state`
--
ALTER TABLE `state`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tournament`
--
ALTER TABLE `tournament`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tournament_category`
--
ALTER TABLE `tournament_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tournament_registration`
--
ALTER TABLE `tournament_registration`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tournament_selected_category`
--
ALTER TABLE `tournament_selected_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `trainee_group`
--
ALTER TABLE `trainee_group`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `training_session`
--
ALTER TABLE `training_session`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `venue`
--
ALTER TABLE `venue`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `venue_photo`
--
ALTER TABLE `venue_photo`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `venue_review`
--
ALTER TABLE `venue_review`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `voucher`
--
ALTER TABLE `voucher`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `voucher_history`
--
ALTER TABLE `voucher_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity`
--
ALTER TABLE `activity`
  ADD CONSTRAINT `activity_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`),
  ADD CONSTRAINT `activity_skill_level_id_foreign` FOREIGN KEY (`skill_level_id`) REFERENCES `skill_level` (`id`),
  ADD CONSTRAINT `activity_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `activity_participant`
--
ALTER TABLE `activity_participant`
  ADD CONSTRAINT `activity_participant_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_participant_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_court_id_foreign` FOREIGN KEY (`court_id`) REFERENCES `court` (`id`),
  ADD CONSTRAINT `booking_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `coach_profile`
--
ALTER TABLE `coach_profile`
  ADD CONSTRAINT `coach_profile_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`),
  ADD CONSTRAINT `coach_profile_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `court`
--
ALTER TABLE `court`
  ADD CONSTRAINT `court_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_member`
--
ALTER TABLE `group_member`
  ADD CONSTRAINT `group_member_trainee_group_id_foreign` FOREIGN KEY (`trainee_group_id`) REFERENCES `trainee_group` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_member_trainee_id_foreign` FOREIGN KEY (`trainee_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `organiser_pass`
--
ALTER TABLE `organiser_pass`
  ADD CONSTRAINT `organiser_pass_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `owner_profile`
--
ALTER TABLE `owner_profile`
  ADD CONSTRAINT `owner_profile_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pricing_rule`
--
ALTER TABLE `pricing_rule`
  ADD CONSTRAINT `pricing_rule_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_attendance`
--
ALTER TABLE `session_attendance`
  ADD CONSTRAINT `session_attendance_group_member_id_foreign` FOREIGN KEY (`group_member_id`) REFERENCES `group_member` (`id`),
  ADD CONSTRAINT `session_attendance_training_session_id_foreign` FOREIGN KEY (`training_session_id`) REFERENCES `training_session` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tournament`
--
ALTER TABLE `tournament`
  ADD CONSTRAINT `tournament_organiser_id_foreign` FOREIGN KEY (`organiser_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `tournament_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`);

--
-- Constraints for table `tournament_registration`
--
ALTER TABLE `tournament_registration`
  ADD CONSTRAINT `tournament_registration_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `tournament_category` (`id`),
  ADD CONSTRAINT `tournament_registration_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `tournament_registration_tournament_id_foreign` FOREIGN KEY (`tournament_id`) REFERENCES `tournament` (`id`),
  ADD CONSTRAINT `tournament_registration_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `tournament_selected_category`
--
ALTER TABLE `tournament_selected_category`
  ADD CONSTRAINT `tournament_selected_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `tournament_category` (`id`),
  ADD CONSTRAINT `tournament_selected_category_tournament_id_foreign` FOREIGN KEY (`tournament_id`) REFERENCES `tournament` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trainee_group`
--
ALTER TABLE `trainee_group`
  ADD CONSTRAINT `trainee_group_coach_id_foreign` FOREIGN KEY (`coach_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `training_session`
--
ALTER TABLE `training_session`
  ADD CONSTRAINT `training_session_trainee_group_id_foreign` FOREIGN KEY (`trainee_group_id`) REFERENCES `trainee_group` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `venue`
--
ALTER TABLE `venue`
  ADD CONSTRAINT `venue_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `venue_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`);

--
-- Constraints for table `venue_photo`
--
ALTER TABLE `venue_photo`
  ADD CONSTRAINT `venue_photo_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `venue_review`
--
ALTER TABLE `venue_review`
  ADD CONSTRAINT `venue_review_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `venue_review_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`);

--
-- Constraints for table `voucher_history`
--
ALTER TABLE `voucher_history`
  ADD CONSTRAINT `voucher_history_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`),
  ADD CONSTRAINT `voucher_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `voucher_history_voucher_id_foreign` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
