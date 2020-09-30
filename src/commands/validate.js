const { Command, flags } = require("@oclif/command")
const { cli } = require("cli-ux")
const chalk = require("chalk")
const {
    ShopifyEngine,
    validateProductVariants,
    logProductVariantValidationResults
} = require("quickbooks-sync")
const { shopify } = require("../../config")

const sb = new ShopifyEngine(shopify)

class ValidateCommand extends Command {
    async run() {
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
