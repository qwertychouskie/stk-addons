<?php
/**
 * copyright 2013 Glenn De Jonghe
 *           2014 Daniel Butum <danibutum at gmail dot com>
 * This file is part of SuperTuxKart
 *
 * stkaddons is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * stkaddons is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with stkaddons.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Server class
 */
class Server
{
    /**
     * @var int
     */
    protected $server_id;

    /**
     * @var int
     */
    protected $host_id;

    /**
     * @var string
     */
    protected $server_name;

    /**
     * @var int
     */
    protected $max_players;

    /**
     * @var array
     */
    protected $info_array = [];

    /**
     *
     * @param array $info_array an associative array based on the database
     */
    protected function __construct(array $info_array)
    {
        $this->info_array = $info_array;
    }

    /**
     * @return mixed
     */
    public function getServerId()
    {
        return $this->info_array['id'];
    }

    /**
     * @return int
     */
    public function getHostId()
    {
        return $this->info_array['hostid'];
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->info_array['name'];
    }

    /**
     * @return int
     */
    public function getMaxPlayers()
    {
        return $this->info_array['max_players'];
    }

    /**
     * Get server as xml output
     *
     * @return string
     */
    public function asXML()
    {
        $server_xml = new XMLOutput();
        $server_xml->startElement('server');
        foreach ($this->info_array as $key => $value)
        {
            $server_xml->writeAttribute($key, $value);
        }
        $server_xml->endElement();

        return $server_xml->asString();
    }

    /**
     * Create server
     *
     * @param string $ip
     * @param int    $port
     * @param int    $private_port
     * @param int    $userid
     * @param string $server_name
     * @param int    $max_players
     *
     * @return Server
     * @throws ServerException
     */
    public static function create($ip, $port, $private_port, $userid, $server_name, $max_players)
    {
        $max_players = (int)$max_players;

        try
        {
            $count = DBConnection::get()->query(
                "SELECT `id` FROM `" . DB_PREFIX . "servers` WHERE `ip`= :ip AND `port`= :port ",
                DBConnection::ROW_COUNT,
                [':ip' => $ip, ':port' => $port]
            );
            if ($count)
            {
                throw new ServerException(_('Specified server already exists.'));
            }

            $result = DBConnection::get()->query(
                "INSERT INTO `" . DB_PREFIX . "servers` (hostid, ip, port, private_port, name, max_players)
                VALUES (:hostid, :ip, :port, :private_port, :name, :max_players)",
                DBConnection::ROW_COUNT,
                [
                    ':hostid'       => $userid,
                    ':ip'           => $ip, // do not use (int) or it truncates to 127.255.255.255
                    ':port'         => $port,
                    ':private_port' => $private_port,
                    ':name'         => $server_name,
                    ':max_players'  => $max_players
                ],
                [
                    ':hostid'       => DBConnection::PARAM_INT,
                    ':ip'           => DBConnection::PARAM_INT,
                    ':port'         => DBConnection::PARAM_INT,
                    ':private_port' => DBConnection::PARAM_INT,
                    ':max_players'  => DBConnection::PARAM_INT,
                ]
            );
        }
        catch(DBException $e)
        {
            throw new ServerException(
                _('An error occurred while creating server.') . ' ' .
                _('Please contact a website administrator.')
            );
        }

        if ($result != 1)
        {
            throw new ServerException(_h('Could not create server'));
        }

        return Server::getServer(DBConnection::get()->lastInsertId());
    }

    /**
     * Get a server instance by id
     *
     * @param int $id
     *
     * @return Server
     * @throws ServerException
     * @throws PDOException
     */
    public static function getServer($id)
    {
        try
        {
            $result = DBConnection::get()->query(
                "SELECT * FROM `" . DB_PREFIX . "servers`
                WHERE `id`= :id",
                DBConnection::FETCH_ALL,
                [':id' => $id],
                [":id" => DBConnection::PARAM_INT]
            );
        }
        catch(DBException $e)
        {
            throw new ServerException(_h('An error occurred while creating server') . '. ' . _h('Please contact a website administrator.'));
        }

        if (empty($result))
        {
            throw new ServerException(_h("Server doesn't exist."));
        }
        else if (count($result) > 1)
        {
            throw new PDOException();
        }

        return new Server($result[0]);
    }

    /**
     * Get all servers as xml output
     *
     * @return string
     */
    public static function getServersAsXML()
    {
        $servers = DBConnection::get()->query(
            "SELECT *
            FROM `" . DB_PREFIX . "servers`",
            DBConnection::FETCH_ALL
        );

        // build xml
        $partial_output = new XMLOutput();
        $partial_output->startElement('servers');
        foreach ($servers as $server_result)
        {
            $server = new Server($server_result);
            $partial_output->insert($server->asXML());
        }
        $partial_output->endElement();

        return $partial_output->asString();
    }
}
