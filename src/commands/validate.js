const { Command, flags } = require("@oclif/command")
const { cli } = require("cli-ux")
const chalk = require("chalk")
const fs = require("fs-extra")
const path = require("path")
const {
    ShopifyEngine,
    validateProductVariants,
    logProductVariantValidationResults
} = require("quickbooks-sync")

class ValidateCommand extends Command {
    async run() {
        const exists = await fs.pathExists(path.join(this.config.configDir, "config.json"))
        if (!exists) {
            console.log("\n")
            console.error(chalk.yellow.bold("    could not locate credentials, please run 'qbsync configure'"))
            console.log("\n")
            return
        }
        const config = await fs.readJSON(path.join(this.config.configDir, "config.json"))

        const sb = new ShopifyEngine(config.shopify)

        cli.action.start(chalk.gray.bold("    fetching product variants"))
        const variants = await sb.getAllProductVariants()
        cli.action.stop(chalk.green.bold("done"))

        cli.action.start(chalk.gray.bold("    validating product variants"))
        const { ok, results } = validateProductVariants(variants)
        cli.action.stop(chalk.green.bold("done"))

        console.log("\n")
        logProductVariantValidationResults({ ok, results })
    }

    async catch(err) {
        console.log("\n")
        console.error(chalk.red.bold("    process encountered an error"))

        throw err
    }
}

ValidateCommand.description = `Validates Shopify product variants
This command retrieves all product variants from Shopify and checks for any errors
such as the existence of duplicate skus, barcodes and fully qualified product names
`

ValidateCommand.flags = {}

module.exports = ValidateCommand
