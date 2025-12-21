-- MySQL Database Initialization Script
-- Generated for react-admin-nestjs project
-- This script creates all tables and populates them with sample data

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Table: migrations
-- Stores migration history
-- ============================================================
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`timestamp`, `name`) VALUES
(1707244388438, 'changeGradeToBeDecimal1707244388438');

-- ============================================================
-- Table: users
-- Main users table
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `email` varchar(500) DEFAULT NULL,
  `password` varchar(500) DEFAULT NULL,
  `phone_number` varchar(11) DEFAULT NULL,
  `active` tinyint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `effective_id` int DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `additionalData` json DEFAULT NULL,
  `userInfo` json DEFAULT NULL,
  `isPaid` tinyint(1) NOT NULL DEFAULT '0',
  `paymentMethod` varchar(255) DEFAULT NULL,
  `mailAddressAlias` varchar(255) DEFAULT NULL,
  `mailAddressTitle` varchar(255) DEFAULT NULL,
  `paymentTrackId` int DEFAULT NULL,
  `bccAddress` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_phone_number_idx` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password: admin123 (hashed with bcrypt)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone_number`, `active`, `isPaid`) VALUES
(1, 'Admin User', 'admin@example.com', '$2b$10$rZJ5Z5Z5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '0501234567', 1, 1),
(2, 'School Manager', 'manager@school.com', '$2b$10$rZJ5Z5Z5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '0507654321', 1, 1),
(3, 'Test Teacher User', 'teacher@school.com', '$2b$10$rZJ5Z5Z5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '0509876543', 1, 0),
(4, 'Data Entry User', 'dataentry@school.com', '$2b$10$rZJ5Z5Z5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '0502468135', 1, 1),
(5, 'Principal User', 'principal@school.com', '$2b$10$rZJ5Z5Z5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '0503691472', 1, 1);

-- ============================================================
-- Table: teachers
-- Teachers information
-- ============================================================
DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `tz` varchar(10) NOT NULL,
  `name` varchar(500) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `phone2` varchar(10) DEFAULT NULL,
  `email` varchar(500) DEFAULT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `displayName` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_teachers_user_tz_year` (`user_id`, `tz`, `year`),
  KEY `teachers_users_idx` (`user_id`),
  KEY `teachers_user_id_phone_idx` (`user_id`, `phone`),
  KEY `teachers_user_id_phone2_idx` (`user_id`, `phone2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `teachers` (`id`, `user_id`, `year`, `tz`, `name`, `phone`, `phone2`, `email`, `displayName`) VALUES
(1, 1, 2024, '123456789', 'Sarah Cohen', '0501111111', '0502222222', 'sarah@school.com', 'Ms. Cohen'),
(2, 1, 2024, '234567890', 'Rachel Levi', '0503333333', NULL, 'rachel@school.com', 'Ms. Levi'),
(3, 1, 2024, '345678901', 'Miriam Goldberg', '0504444444', '0505555555', 'miriam@school.com', 'Ms. Goldberg'),
(4, 2, 2024, '456789012', 'David Klein', '0506666666', NULL, 'david@school.com', 'Mr. Klein'),
(5, 2, 2024, '567890123', 'Yael Schwartz', '0507777777', NULL, 'yael@school.com', 'Ms. Schwartz'),
(6, 1, 2024, '678901234', 'Esther Rosenberg', '0508888888', '0509999999', 'esther@school.com', 'Ms. Rosenberg'),
(7, 2, 2024, '789012345', 'Tamar Friedman', '0501231231', NULL, 'tamar@school.com', 'Ms. Friedman'),
(8, 1, 2024, '890123456', 'Leah Katz', '0502342342', NULL, 'leah@school.com', 'Ms. Katz'),
(9, 3, 2024, '901234567', 'Chana Weiss', '0503453453', NULL, 'chana@school.com', 'Ms. Weiss'),
(10, 3, 2024, '012345678', 'Rivka Stein', '0504564564', '0505675675', 'rivka@school.com', 'Ms. Stein');

-- ============================================================
-- Table: students
-- Students information
-- ============================================================
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `tz` varchar(10) NOT NULL,
  `name` varchar(500) NOT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `phone` varchar(1000) DEFAULT NULL,
  `address` varchar(1000) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_students_user_tz_year` (`user_id`, `tz`, `year`),
  KEY `students_users_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `students` (`id`, `user_id`, `year`, `tz`, `name`, `phone`, `address`, `is_active`) VALUES
(1, 1, 2024, '111111111', 'Avigail Abramson', '0521111111', '123 Main St, Jerusalem', 1),
(2, 1, 2024, '222222222', 'Bracha Ben-David', '0522222222', '456 Oak Ave, Tel Aviv', 1),
(3, 1, 2024, '333333333', 'Chaya Cohen', '0523333333', '789 Pine Rd, Haifa', 1),
(4, 1, 2024, '444444444', 'Devorah Dayan', '0524444444', '321 Elm St, Bnei Brak', 1),
(5, 1, 2024, '555555555', 'Elisheva Ezra', '0525555555', '654 Cedar Ln, Netanya', 1),
(6, 2, 2024, '666666666', 'Freida Friedman', '0526666666', '987 Maple Dr, Ashdod', 1),
(7, 2, 2024, '777777777', 'Gittel Goldstein', '0527777777', '147 Birch Ct, Petah Tikva', 1),
(8, 2, 2024, '888888888', 'Hadassah Horowitz', '0528888888', '258 Spruce Way, Ramat Gan', 1),
(9, 1, 2024, '999999999', 'Irit Israel', '0529999999', '369 Willow St, Rehovot', 1),
(10, 3, 2024, '101010101', 'Judith Jacob', '0521010101', '741 Ash Blvd, Herzliya', 1),
(11, 3, 2024, '121212121', 'Kayla Klein', '0521212121', '852 Poplar Rd, Holon', 1),
(12, 2, 2024, '131313131', 'Leah Levy', '0521313131', '963 Chestnut Ave, Bat Yam', 1),
(13, 1, 2024, '141414141', 'Malka Miller', '0521414141', '159 Sycamore Ln, Kfar Saba', 1),
(14, 1, 2024, '151515151', 'Nechama Newman', '0521515151', '357 Redwood Dr, Raanana', 1),
(15, 2, 2024, '161616161', 'Orly Ostrovsky', '0521616161', '486 Hickory Ct, Rishon LeZion', 1);

-- ============================================================
-- Table: klass_types
-- Class types (base class, track, speciality, other)
-- ============================================================
DROP TABLE IF EXISTS `klass_types`;
CREATE TABLE `klass_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `key` int NOT NULL,
  `name` varchar(500) NOT NULL,
  `klassTypeEnum` varchar(255) NOT NULL DEFAULT 'אחר',
  `teacher_id` varchar(10) DEFAULT NULL,
  `teacherReferenceId` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `klass_types_users_idx` (`user_id`),
  KEY `klass_types_klassTypeEnum_idx` (`klassTypeEnum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `klass_types` (`id`, `user_id`, `key`, `name`, `klassTypeEnum`, `teacher_id`, `teacherReferenceId`) VALUES
(1, 1, 1, 'Aleph Class', 'כיתת אם', '123456789', 1),
(2, 1, 2, 'Bet Class', 'כיתת אם', '234567890', 2),
(3, 1, 3, 'Gimel Class', 'כיתת אם', '345678901', 3),
(4, 1, 4, 'Math Track', 'מסלול', NULL, NULL),
(5, 1, 5, 'Science Track', 'מסלול', NULL, NULL),
(6, 2, 6, 'Literature Track', 'מסלול', '456789012', 4),
(7, 2, 7, 'Computer Science', 'התמחות', '567890123', 5),
(8, 1, 8, 'Arts', 'התמחות', '678901234', 6),
(9, 1, 9, 'Music', 'התמחות', NULL, NULL),
(10, 2, 10, 'Advanced Studies', 'אחר', '789012345', 7);

-- ============================================================
-- Table: klasses
-- Classes/Groups
-- ============================================================
DROP TABLE IF EXISTS `klasses`;
CREATE TABLE `klasses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `key` int NOT NULL,
  `name` varchar(500) NOT NULL,
  `display_name` varchar(500) DEFAULT NULL,
  `klass_type_id` int DEFAULT NULL,
  `klassTypeReferenceId` int DEFAULT NULL,
  `teacher_id` varchar(10) DEFAULT NULL,
  `teacherReferenceId` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_klasses_user_key_year` (`user_id`, `key`, `year`),
  KEY `klasses_users_idx` (`user_id`),
  KEY `klasses_user_id_key_idx` (`user_id`, `key`),
  KEY `klasses_klass_type_reference_id_idx` (`klassTypeReferenceId`),
  KEY `klasses_teacher_reference_id_idx` (`teacherReferenceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `klasses` (`id`, `user_id`, `year`, `key`, `name`, `display_name`, `klass_type_id`, `klassTypeReferenceId`, `teacher_id`, `teacherReferenceId`) VALUES
(1, 1, 2024, 1, 'Class Aleph-1', 'א-1', 1, 1, '123456789', 1),
(2, 1, 2024, 2, 'Class Aleph-2', 'א-2', 1, 1, '234567890', 2),
(3, 1, 2024, 3, 'Class Bet-1', 'ב-1', 2, 2, '345678901', 3),
(4, 1, 2024, 4, 'Class Bet-2', 'ב-2', 2, 2, '456789012', 4),
(5, 1, 2024, 5, 'Class Gimel-1', 'ג-1', 3, 3, '567890123', 5),
(6, 2, 2024, 6, 'Math Group A', 'Math-A', 4, 4, '678901234', 6),
(7, 2, 2024, 7, 'Math Group B', 'Math-B', 4, 4, '789012345', 7),
(8, 1, 2024, 8, 'Science Group A', 'Sci-A', 5, 5, '890123456', 8),
(9, 1, 2024, 9, 'Literature Group', 'Lit', 6, 6, '901234567', 9),
(10, 2, 2024, 10, 'CS Advanced', 'CS-Adv', 7, 7, '012345678', 10);

-- ============================================================
-- Table: lessons
-- Lessons/Courses
-- ============================================================
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `key` int NOT NULL,
  `name` varchar(500) NOT NULL,
  `display_name` varchar(500) DEFAULT NULL,
  `klasses` varchar(450) DEFAULT NULL,
  `klassReferenceIds` text,
  `klass_reference_ids_json` json GENERATED ALWAYS AS (cast(concat('[',coalesce(`klassReferenceIds`,''),']') as json)) STORED,
  `teacher_id` varchar(10) DEFAULT NULL,
  `teacherReferenceId` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `how_many_lessons` float DEFAULT NULL,
  `order` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_lessons_user_key_year` (`user_id`, `key`, `year`),
  KEY `lessons_users_idx` (`user_id`),
  KEY `lessons_user_id_key_idx` (`user_id`, `key`),
  KEY `lessons_teacher_reference_id_idx` (`teacherReferenceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lessons` (`id`, `user_id`, `year`, `key`, `name`, `display_name`, `klasses`, `klassReferenceIds`, `teacher_id`, `teacherReferenceId`, `start_date`, `end_date`, `how_many_lessons`, `order`) VALUES
(1, 1, 2024, 1, 'Mathematics', 'Math', '1,2', '1,2', '123456789', 1, '2024-09-01', '2024-12-31', 40, 1),
(2, 1, 2024, 2, 'Hebrew', 'Hebrew', '1,2,3', '1,2,3', '234567890', 2, '2024-09-01', '2024-12-31', 45, 2),
(3, 1, 2024, 3, 'English', 'English', '3,4', '3,4', '345678901', 3, '2024-09-01', '2024-12-31', 38, 3),
(4, 1, 2024, 4, 'Science', 'Science', '5', '5', '456789012', 4, '2024-09-01', '2024-12-31', 42, 4),
(5, 1, 2024, 5, 'History', 'History', '4,5', '4,5', '567890123', 5, '2024-09-01', '2024-12-31', 35, 5),
(6, 2, 2024, 6, 'Geography', 'Geo', '6,7', '6,7', '678901234', 6, '2024-09-01', '2024-12-31', 30, 6),
(7, 2, 2024, 7, 'Computer Studies', 'CS', '10', '10', '789012345', 7, '2024-09-01', '2024-12-31', 48, 7),
(8, 1, 2024, 8, 'Literature', 'Lit', '9', '9', '890123456', 8, '2024-09-01', '2024-12-31', 36, 8),
(9, 1, 2024, 9, 'Physics', 'Physics', '8', '8', '901234567', 9, '2024-09-01', '2024-12-31', 44, 9),
(10, 3, 2024, 10, 'Chemistry', 'Chem', '8', '8', '012345678', 10, '2024-09-01', '2024-12-31', 41, 10);

-- ============================================================
-- Table: student_klasses
-- Student-Class assignments
-- ============================================================
DROP TABLE IF EXISTS `student_klasses`;
CREATE TABLE `student_klasses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `student_tz` varchar(10) DEFAULT NULL,
  `studentReferenceId` int DEFAULT NULL,
  `klass_id` int DEFAULT NULL,
  `klassReferenceId` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_klasses_users_idx` (`user_id`),
  KEY `student_klasses_user_year_idx` (`user_id`, `year`),
  KEY `student_klasses_student_reference_id_year_idx` (`studentReferenceId`, `year`),
  KEY `student_klasses_user_klass_year_idx` (`user_id`, `klassReferenceId`, `year`),
  KEY `student_klasses_user_student_klass_year_idx` (`user_id`, `studentReferenceId`, `klassReferenceId`, `year`),
  KEY `IDX_student_klasses_studentReferenceId_year` (`studentReferenceId`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `student_klasses` (`id`, `user_id`, `year`, `student_tz`, `studentReferenceId`, `klass_id`, `klassReferenceId`) VALUES
(1, 1, 2024, '111111111', 1, 1, 1),
(2, 1, 2024, '222222222', 2, 1, 1),
(3, 1, 2024, '333333333', 3, 2, 2),
(4, 1, 2024, '444444444', 4, 2, 2),
(5, 1, 2024, '555555555', 5, 3, 3),
(6, 2, 2024, '666666666', 6, 4, 4),
(7, 2, 2024, '777777777', 7, 5, 5),
(8, 2, 2024, '888888888', 8, 6, 6),
(9, 1, 2024, '999999999', 9, 7, 7),
(10, 3, 2024, '101010101', 10, 8, 8),
(11, 3, 2024, '121212121', 11, 9, 9),
(12, 2, 2024, '131313131', 12, 10, 10),
(13, 1, 2024, '141414141', 13, 1, 1),
(14, 1, 2024, '151515151', 14, 3, 3),
(15, 2, 2024, '161616161', 15, 5, 5);

-- ============================================================
-- Table: att_reports
-- Attendance reports
-- ============================================================
DROP TABLE IF EXISTS `att_reports`;
CREATE TABLE `att_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `student_tz` varchar(10) DEFAULT NULL,
  `studentReferenceId` int DEFAULT NULL,
  `teacher_id` varchar(10) DEFAULT NULL,
  `teacherReferenceId` int DEFAULT NULL,
  `klass_id` int DEFAULT NULL,
  `klassReferenceId` int DEFAULT NULL,
  `lesson_id` int DEFAULT NULL,
  `lessonReferenceId` int DEFAULT NULL,
  `report_date` date NOT NULL,
  `how_many_lessons` float DEFAULT NULL,
  `abs_count` float NOT NULL DEFAULT '0',
  `approved_abs_count` float NOT NULL DEFAULT '0',
  `comments` varchar(500) DEFAULT NULL,
  `sheet_name` varchar(100) DEFAULT NULL,
  `reportGroupSessionId` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `att_users_idx` (`user_id`),
  KEY `att_user_sheet_name_lession_klass_year_idx` (`user_id`, `sheet_name`, `lessonReferenceId`, `klassReferenceId`, `year`),
  KEY `att_user_year_idx` (`user_id`, `year`),
  KEY `att_user_year_student_reference_id_idx` (`user_id`, `studentReferenceId`, `year`),
  KEY `att_user_year_teacher_reference_id_idx` (`user_id`, `teacherReferenceId`, `year`),
  KEY `att_user_year_lesson_reference_id_idx` (`user_id`, `lessonReferenceId`, `year`),
  KEY `att_reports_student_reference_id_idx` (`studentReferenceId`),
  KEY `att_reports_teacher_reference_id_idx` (`teacherReferenceId`),
  KEY `att_reports_klass_reference_id_idx` (`klassReferenceId`),
  KEY `att_reports_lesson_reference_id_idx` (`lessonReferenceId`),
  KEY `att_reports_report_date_idx` (`report_date`),
  KEY `att_reports_report_group_session_id_idx` (`reportGroupSessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `att_reports` (`id`, `user_id`, `year`, `student_tz`, `studentReferenceId`, `teacher_id`, `teacherReferenceId`, `klass_id`, `klassReferenceId`, `lesson_id`, `lessonReferenceId`, `report_date`, `how_many_lessons`, `abs_count`, `approved_abs_count`) VALUES
(1, 1, 2024, '111111111', 1, '123456789', 1, 1, 1, 1, 1, '2024-10-01', 2, 0, 0),
(2, 1, 2024, '222222222', 2, '123456789', 1, 1, 1, 1, 1, '2024-10-01', 2, 1, 0),
(3, 1, 2024, '333333333', 3, '234567890', 2, 2, 2, 2, 2, '2024-10-01', 2, 0, 0),
(4, 1, 2024, '444444444', 4, '234567890', 2, 2, 2, 2, 2, '2024-10-01', 2, 0.5, 0.5),
(5, 1, 2024, '555555555', 5, '345678901', 3, 3, 3, 3, 3, '2024-10-01', 2, 0, 0),
(6, 2, 2024, '666666666', 6, '456789012', 4, 4, 4, 4, 4, '2024-10-02', 2, 1.5, 1),
(7, 2, 2024, '777777777', 7, '567890123', 5, 5, 5, 5, 5, '2024-10-02', 2, 0, 0),
(8, 2, 2024, '888888888', 8, '678901234', 6, 6, 6, 6, 6, '2024-10-02', 1, 0, 0),
(9, 1, 2024, '999999999', 9, '789012345', 7, 7, 7, 7, 7, '2024-10-03', 2, 2, 0),
(10, 3, 2024, '101010101', 10, '890123456', 8, 8, 8, 8, 8, '2024-10-03', 2, 0, 0),
(11, 1, 2024, '111111111', 1, '234567890', 2, 1, 1, 2, 2, '2024-10-05', 2, 0, 0),
(12, 1, 2024, '333333333', 3, '345678901', 3, 2, 2, 3, 3, '2024-10-05', 2, 1, 1),
(13, 2, 2024, '666666666', 6, '456789012', 4, 4, 4, 5, 5, '2024-10-06', 2, 0, 0),
(14, 1, 2024, '555555555', 5, '567890123', 5, 3, 3, 5, 5, '2024-10-07', 2, 0.5, 0),
(15, 2, 2024, '888888888', 8, '789012345', 7, 7, 7, 7, 7, '2024-10-08', 2, 0, 0);

-- ============================================================
-- Table: grades
-- Grades/Marks
-- ============================================================
DROP TABLE IF EXISTS `grades`;
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `student_tz` varchar(10) DEFAULT NULL,
  `studentReferenceId` int DEFAULT NULL,
  `teacher_id` varchar(10) DEFAULT NULL,
  `teacherReferenceId` int DEFAULT NULL,
  `klass_id` int DEFAULT NULL,
  `klassReferenceId` int DEFAULT NULL,
  `lesson_id` int DEFAULT NULL,
  `lessonReferenceId` int DEFAULT NULL,
  `report_date` date NOT NULL,
  `how_many_lessons` float DEFAULT NULL,
  `grade` float NOT NULL DEFAULT '0',
  `estimation` varchar(500) DEFAULT NULL,
  `comments` varchar(500) DEFAULT NULL,
  `reportGroupSessionId` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `grades_users_idx` (`user_id`),
  KEY `grades_user_lesson_klass_year_idx` (`user_id`, `lessonReferenceId`, `klassReferenceId`, `year`),
  KEY `grades_student_reference_id_idx` (`studentReferenceId`),
  KEY `grades_teacher_reference_id_idx` (`teacherReferenceId`),
  KEY `grades_klass_reference_id_idx` (`klassReferenceId`),
  KEY `grades_lesson_reference_id_idx` (`lessonReferenceId`),
  KEY `grades_report_date_idx` (`report_date`),
  KEY `grades_report_group_session_id_idx` (`reportGroupSessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `grades` (`id`, `user_id`, `year`, `student_tz`, `studentReferenceId`, `teacher_id`, `teacherReferenceId`, `klass_id`, `klassReferenceId`, `lesson_id`, `lessonReferenceId`, `report_date`, `how_many_lessons`, `grade`, `estimation`) VALUES
(1, 1, 2024, '111111111', 1, '123456789', 1, 1, 1, 1, 1, '2024-10-15', 10, 95.5, 'Excellent'),
(2, 1, 2024, '222222222', 2, '123456789', 1, 1, 1, 1, 1, '2024-10-15', 10, 88.0, 'Very Good'),
(3, 1, 2024, '333333333', 3, '234567890', 2, 2, 2, 2, 2, '2024-10-15', 12, 92.5, 'Excellent'),
(4, 1, 2024, '444444444', 4, '234567890', 2, 2, 2, 2, 2, '2024-10-15', 12, 85.0, 'Good'),
(5, 1, 2024, '555555555', 5, '345678901', 3, 3, 3, 3, 3, '2024-10-15', 10, 90.0, 'Very Good'),
(6, 2, 2024, '666666666', 6, '456789012', 4, 4, 4, 4, 4, '2024-10-16', 11, 93.5, 'Excellent'),
(7, 2, 2024, '777777777', 7, '567890123', 5, 5, 5, 5, 5, '2024-10-16', 9, 87.5, 'Very Good'),
(8, 2, 2024, '888888888', 8, '678901234', 6, 6, 6, 6, 6, '2024-10-16', 8, 91.0, 'Excellent'),
(9, 1, 2024, '999999999', 9, '789012345', 7, 7, 7, 7, 7, '2024-10-17', 12, 78.5, 'Good'),
(10, 3, 2024, '101010101', 10, '890123456', 8, 8, 8, 8, 8, '2024-10-17', 10, 94.0, 'Excellent'),
(11, 1, 2024, '111111111', 1, '234567890', 2, 1, 1, 2, 2, '2024-10-20', 12, 89.5, 'Very Good'),
(12, 1, 2024, '333333333', 3, '345678901', 3, 2, 2, 3, 3, '2024-10-20', 10, 96.0, 'Outstanding'),
(13, 2, 2024, '666666666', 6, '567890123', 5, 4, 4, 5, 5, '2024-10-21', 9, 86.0, 'Good'),
(14, 1, 2024, '555555555', 5, '567890123', 5, 3, 3, 5, 5, '2024-10-22', 9, 91.5, 'Excellent'),
(15, 2, 2024, '888888888', 8, '789012345', 7, 7, 7, 7, 7, '2024-10-23', 12, 88.5, 'Very Good');

-- ============================================================
-- Table: known_absences
-- Known/Approved absences
-- ============================================================
DROP TABLE IF EXISTS `known_absences`;
CREATE TABLE `known_absences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `student_tz` varchar(10) DEFAULT NULL,
  `studentReferenceId` int DEFAULT NULL,
  `klass_id` int DEFAULT NULL,
  `klassReferenceId` int DEFAULT NULL,
  `lesson_id` int DEFAULT NULL,
  `lessonReferenceId` int DEFAULT NULL,
  `report_date` date NOT NULL,
  `absnce_count` int DEFAULT NULL,
  `absnce_code` int DEFAULT NULL,
  `sender_name` varchar(100) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `comment` varchar(500) DEFAULT NULL,
  `isApproved` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `known_users_idx` (`user_id`),
  KEY `IDX_known_absences_studentReferenceId_year` (`studentReferenceId`, `year`),
  KEY `known_absences_student_reference_id_idx` (`studentReferenceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `known_absences` (`id`, `user_id`, `year`, `student_tz`, `studentReferenceId`, `klass_id`, `klassReferenceId`, `lesson_id`, `lessonReferenceId`, `report_date`, `absnce_count`, `absnce_code`, `sender_name`, `reason`, `isApproved`) VALUES
(1, 1, 2024, '222222222', 2, 1, 1, 1, 1, '2024-10-01', 1, 1, 'Parent', 'Medical appointment', 1),
(2, 1, 2024, '444444444', 4, 2, 2, 2, 2, '2024-10-01', 1, 2, 'Parent', 'Family event', 1),
(3, 2, 2024, '666666666', 6, 4, 4, 4, 4, '2024-10-02', 2, 1, 'Doctor', 'Sick', 1),
(4, 1, 2024, '999999999', 9, 7, 7, 7, 7, '2024-10-03', 2, 3, 'Parent', 'Religious holiday', 1),
(5, 1, 2024, '333333333', 3, 2, 2, 3, 3, '2024-10-05', 1, 1, 'Parent', 'Illness', 1),
(6, 2, 2024, '888888888', 8, 7, 7, 7, 7, '2024-10-08', 1, 4, 'School', 'School trip', 1),
(7, 1, 2024, '555555555', 5, 3, 3, 5, 5, '2024-10-07', 1, 2, 'Parent', 'Personal matter', 0),
(8, 1, 2024, '111111111', 1, 1, 1, 1, 1, '2024-10-10', 1, 1, 'Parent', 'Medical checkup', 1),
(9, 2, 2024, '777777777', 7, 5, 5, 5, 5, '2024-10-12', 1, 3, 'Parent', 'Family celebration', 1),
(10, 3, 2024, '121212121', 11, 9, 9, NULL, NULL, '2024-10-14', 1, 1, 'Parent', 'Cold', 1);

-- ============================================================
-- Table: report_month
-- Report month periods
-- ============================================================
DROP TABLE IF EXISTS `report_month`;
CREATE TABLE `report_month` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `semester` varchar(255) NOT NULL DEFAULT 'שנתי',
  `year` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_month_user_id_idx` (`userId`),
  KEY `report_month_user_id_start_date_end_date_idx` (`userId`, `startDate`, `endDate`),
  KEY `report_month_user_id_year_idx` (`userId`, `year`),
  KEY `report_month_user_id_start_date_end_date_year_idx` (`userId`, `startDate`, `endDate`, `year`),
  KEY `report_month_start_date_idx` (`startDate`),
  KEY `report_month_end_date_idx` (`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `report_month` (`id`, `userId`, `name`, `startDate`, `endDate`, `semester`, `year`) VALUES
(1, 1, 'September 2024', '2024-09-01', '2024-09-30', 'א', 2024),
(2, 1, 'October 2024', '2024-10-01', '2024-10-31', 'א', 2024),
(3, 1, 'November 2024', '2024-11-01', '2024-11-30', 'א', 2024),
(4, 1, 'December 2024', '2024-12-01', '2024-12-31', 'א', 2024),
(5, 2, 'September 2024', '2024-09-01', '2024-09-30', 'א', 2024),
(6, 2, 'October 2024', '2024-10-01', '2024-10-31', 'א', 2024),
(7, 1, 'Semester 1', '2024-09-01', '2024-12-31', 'א', 2024),
(8, 2, 'Semester 1', '2024-09-01', '2024-12-31', 'א', 2024),
(9, 3, 'October 2024', '2024-10-01', '2024-10-31', 'א', 2024),
(10, 3, 'November 2024', '2024-11-01', '2024-11-30', 'א', 2024);

-- ============================================================
-- Table: grade_names
-- Custom grade name mappings
-- ============================================================
DROP TABLE IF EXISTS `grade_names`;
CREATE TABLE `grade_names` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `key` int NOT NULL,
  `name` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `grade_names_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `grade_names` (`id`, `user_id`, `key`, `name`) VALUES
(1, 1, 100, 'Outstanding'),
(2, 1, 95, 'Excellent'),
(3, 1, 90, 'Very Good'),
(4, 1, 85, 'Good'),
(5, 1, 80, 'Above Average'),
(6, 2, 100, 'Perfect'),
(7, 2, 90, 'Great'),
(8, 2, 80, 'Good'),
(9, 1, 75, 'Satisfactory'),
(10, 3, 95, 'Excellent Work');

-- ============================================================
-- Table: attendance_names
-- Custom attendance name mappings
-- ============================================================
DROP TABLE IF EXISTS `attendance_names`;
CREATE TABLE `attendance_names` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `key` int NOT NULL,
  `name` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `attendance_names_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `attendance_names` (`id`, `user_id`, `key`, `name`) VALUES
(1, 1, 1, 'Medical'),
(2, 1, 2, 'Family Event'),
(3, 1, 3, 'Religious Holiday'),
(4, 1, 4, 'School Activity'),
(5, 1, 5, 'Personal'),
(6, 2, 1, 'Sick'),
(7, 2, 2, 'Appointment'),
(8, 2, 3, 'Holiday'),
(9, 3, 1, 'Medical Leave'),
(10, 3, 2, 'Other');

-- ============================================================
-- Table: report_groups
-- Report groups for batch reporting
-- ============================================================
DROP TABLE IF EXISTS `report_groups`;
CREATE TABLE `report_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `signatureData` longtext,
  `teacherReferenceId` int DEFAULT NULL,
  `lessonReferenceId` int DEFAULT NULL,
  `klassReferenceId` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_groups_user_id_idx` (`user_id`),
  KEY `report_groups_user_id_year_idx` (`user_id`, `year`),
  KEY `report_groups_teacher_reference_id_idx` (`teacherReferenceId`),
  KEY `report_groups_lesson_reference_id_idx` (`lessonReferenceId`),
  KEY `report_groups_klass_reference_id_idx` (`klassReferenceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `report_groups` (`id`, `user_id`, `name`, `topic`, `teacherReferenceId`, `lessonReferenceId`, `klassReferenceId`, `year`) VALUES
(1, 1, 'Math Class A - October', 'Algebra basics', 1, 1, 1, 2024),
(2, 1, 'Hebrew Class - October', 'Grammar and composition', 2, 2, 1, 2024),
(3, 1, 'English Class - October', 'Reading comprehension', 3, 3, 3, 2024),
(4, 2, 'Science Class - October', 'Biology fundamentals', 6, 6, 6, 2024),
(5, 2, 'CS Advanced - October', 'Programming basics', 7, 7, 10, 2024);

-- ============================================================
-- Table: report_group_sessions
-- Individual sessions within report groups
-- ============================================================
DROP TABLE IF EXISTS `report_group_sessions`;
CREATE TABLE `report_group_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `reportGroupId` int NOT NULL,
  `sessionDate` date NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_group_sessions_user_id_idx` (`userId`),
  KEY `report_group_sessions_report_group_id_idx` (`reportGroupId`),
  KEY `report_group_sessions_session_date_idx` (`sessionDate`),
  CONSTRAINT `FK_report_group_sessions_reportGroupId` FOREIGN KEY (`reportGroupId`) REFERENCES `report_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `report_group_sessions` (`id`, `userId`, `reportGroupId`, `sessionDate`, `startTime`, `endTime`, `topic`) VALUES
(1, 1, 1, '2024-10-01', '08:00:00', '09:30:00', 'Introduction to Algebra'),
(2, 1, 1, '2024-10-08', '08:00:00', '09:30:00', 'Linear equations'),
(3, 1, 2, '2024-10-02', '10:00:00', '11:30:00', 'Grammar review'),
(4, 1, 3, '2024-10-03', '13:00:00', '14:30:00', 'Reading strategies'),
(5, 2, 4, '2024-10-04', '09:00:00', '10:30:00', 'Cell structure'),
(6, 2, 5, '2024-10-05', '11:00:00', '12:30:00', 'Variables and data types'),
(7, 1, 1, '2024-10-15', '08:00:00', '09:30:00', 'Quadratic equations'),
(8, 1, 2, '2024-10-16', '10:00:00', '11:30:00', 'Essay writing'),
(9, 2, 4, '2024-10-18', '09:00:00', '10:30:00', 'Photosynthesis'),
(10, 2, 5, '2024-10-19', '11:00:00', '12:30:00', 'Control structures');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Views
-- Critical view entities required by the application
-- ============================================================

-- View: student_base_klass
CREATE OR REPLACE VIEW `student_base_klass` AS
SELECT 
  `student_klasses`.`studentReferenceId` AS `id`,
  `student_klasses`.`user_id` AS `user_id`,
  `student_klasses`.`year` AS `year`,
  GROUP_CONCAT(DISTINCT IF(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, NULL) SEPARATOR ', ') AS `base_klass`
FROM `student_klasses`
LEFT JOIN `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`
LEFT JOIN `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId`
GROUP BY `studentReferenceId`, `user_id`, `year`;

-- View: lesson_klass_name
CREATE OR REPLACE VIEW `lesson_klass_name` AS
SELECT 
  `lessons`.`id` AS `id`,
  `lessons`.`user_id` AS `user_id`,
  `lessons`.`year` AS `year`,
  `lessons`.`name` AS `lesson_name`,
  GROUP_CONCAT(DISTINCT `klasses`.`name` ORDER BY `klasses`.`key` SEPARATOR ', ') AS `klass_names`
FROM `lessons`
LEFT JOIN `klasses` ON FIND_IN_SET(`klasses`.`id`, `lessons`.`klassReferenceIds`)
GROUP BY `lessons`.`id`, `lessons`.`user_id`, `lessons`.`year`, `lessons`.`name`;

