<?php
/* copyright 2009 Lucas Baudin <xapantu@gmail.com>                 
                                                                              
 This file is part of stkaddons.                                 
                                                                              
 stkaddons is free software: you can redistribute it and/or      
 modify it under the terms of the GNU General Public License as published by  
 the Free Software Foundation, either version 3 of the License, or (at your   
 option) any later version.                                                   
                                                                              
 stkaddons is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for    
 more details.                                                                
                                                                              
 You should have received a copy of the GNU General Public License along with 
 stkaddons.  If not, see <http://www.gnu.org/licenses/>.   */
?>
<?php
$dirUpload = "/media/serveur/stkaddons/upload/";
$dirDownload = "http://127.0.0.1/stkaddons/upload/";
$style="default";
$admin = "yourname@example.com";

define("DB_USER", 'root');
define("DB_PASSWORD", 'pass');
define("DB_NAME", 'stkbase');
define("DB_HOST", 'localhost');
define("UP_LOCATION", $dirUpload);
define("DOWN_LOCATION", $dirDownload);
?>