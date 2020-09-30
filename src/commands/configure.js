const { Command, flags } = require("@oclif/command")
const { cli } = require("cli-ux")
const chalk = require("chalk")
const fs = require("fs-extra")
const path = require("path")

class ConfigureCommand extends Command {
    async run() {
        console.log(chalk.gray.bold("    shopify configuration:"))
        const shop = await cli.prompt("        shopify store name")
        const admin_api_password = await cli.prompt("        shopify admin api password", { type: "mask" })
        const storefront_api_access_token = await cli.prompt("        shopify storefront api access token", { type: "mask" })
        console.log("\n")

        console.log(chalk.gray.bold("    quickbooks production configuration:"))
        const production_client_id = await cli.prompt("        quickbooks client id (production)")
        const production_client_secret = await cli.prompt("       quickbooks client secret (production)", { type: "mask" })
        const production_realm_id = await cli.prompt("        quickbooks realm id (production)")
        const production_access_token = await cli.prompt("        quickbooks access token (production)", { type: "mask" })
        const production_refresh_token = await cli.prompt("        quickbooks refresh token (production)", { type: "mask" })
        console.log("\n")

        console.log(chalk.gray.bold("    quickbooks sandbox configuration:"))
        const sandbox_client_id = await cli.prompt("        quickbooks client id (sandbox)")
        const sandbox_client_secret = await cli.prompt("        quickbooks client secret (sandbox)", { type: "mask" })
        const sandbox_realm_id = await cli.prompt("        quickbooks realm id (sandbox)")
        const sandbox_access_token = await cli.prompt("        quickbooks access token (sandbox)", { type: "mask" })
        const sandbox_refresh_token = await cli.prompt("        quickbooks refresh token (sandbox)", { type: "mask" })
        console.log("\n")

        const config = {
            shopify: {
                shop,
                admin_api_password,
                storefront_api_access_token
            },
            quickbooks_production: {
                client_id: production_client_id,
                client_secret: production_client_secret,
                realm_id: production_realm_id,
                access_token: production_access_token,
                refresh_token: production_refresh_token
            },
            quickbooks_sandbox: {
                client_id: sandbox_client_id,
                client_secret: sandbox_client_secret,
                realm_id: sandbox_realm_id,
                access_token: sandbox_access_token,
                refresh_token: sandbox_refresh_token
            }
        }

        cli.action.start(chalk.gray.bold("    saving configuration"))
        await fs.ensureDir(this.config.configDir)
        await fs.writeJson(path.join(this.config.configDir, "config.json"), config)
        cli.action.stop(chalk.green.bold("done"))

        console.log("\n")
        console.log(chalk.green.bold("    qbsync has been successfully configured"))
        console.log("\n")
    }

    async catch(err) {
        console.log("\n")
        console.error(chalk.red.bold("    process encountered an error"))

        throw err
    }
}

ConfigureCommand.description = `Sets up the tool by configuring the required Shopify and Quickbooks access tokens
`

ConfigureCommand.flags = {}

module.exports = ConfigureCommand