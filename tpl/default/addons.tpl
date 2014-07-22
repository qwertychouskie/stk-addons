{config_load file="{$smarty.current_dir}/tpl.conf"}
{include file=#header#}
<div class="container" id="addon-main">
    <div class="row">
        <div class="col-sm-2 col-md-2 left-menu" id="addon-menu">
            {$addon.menu}
        </div>
        <div class="col-sm-10 col-md-10">
            <div id="addon-status">
                {$addon.status}
            </div>
            <div id="addon-body">
                {$addon.body}
            </div>
        </div>
    </div>
</div>
{include file=#footer#}