INSERT INTO `ExportJob` (`type`,`params`,`status`,`createdAt`,`updatedAt`) VALUES ("SNMPB","{}","PROCESSING",NOW(),NOW());
SELECT LAST_INSERT_ID();
