<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seeds the owner/staff sub-roles (§3 of the Person A plan) into a
 * tenant's own database. Run inside Tenant::run() — never against the
 * central connection. Idempotent (firstOrCreate throughout), so it's safe
 * to call again on an existing tenant (e.g. after adding a new permission).
 */
class TenantPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $inviteStaff = Permission::firstOrCreate(['name' => 'staff.invite', 'guard_name' => 'tenant']);
        $manageSettings = Permission::firstOrCreate(['name' => 'settings.manage', 'guard_name' => 'tenant']);

        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'tenant']);
        Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'tenant']);

        $owner->givePermissionTo([$inviteStaff, $manageSettings]);
    }
}
