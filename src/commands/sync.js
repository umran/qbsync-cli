const { Command, flags } = require("@oclif/command")
const { cli } = require("cli-ux")
const chalk = require("chalk")
const {
    QuickBooksEngine,
    ShopifyEngine,
    validateProductVariants,
    logProductVariantValidationResults,
    parseProduct
} = require("quickbooks-sync")
const { shopify: shopify_config, quickbooks: quickbooks_config } = require("../../config")

const sb = new ShopifyEngine(shopify_config)
const qb = new QuickBooksEngine(quickbooks_config)

class SyncCommand extends Command {
    async run() {
        cli.action.start(chalk.gray.bold("    fetching product variants"))
        const variants = await sb.getAllProductVariants()
        cli.action.stop(chalk.green.bold("done"))

        cli.action.start(chalk.gray.bold("    validating product variants"))
        const { ok, results } = validateProductVariants(variants)
        cli.action.stop(chalk.green.bold("done"))

        if (!ok) {
            console.log("\n")
            logProductVariantValidationResults({ ok, results })
            return
        }

        // since there are no validation errors we can proceed with syncing the products
        cli.action.start(chalk.gray.bold("    refreshing access token"))
        await qb.refreshAccessToken()
        cli.action.stop(chalk.green.bold("done"))

        // create a progress bar
        const progress = cli.progress({
            format: `    ${chalk.gray.bold("syncing product variants | ")}${chalk.greenBright.bold("{bar}")}${chalk.gray.bold(" | {value}/{total} items")}`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
        })
        progress.start(variants.length, 0)
        for (const variant of variants) {
            const product = parseProduct(variant)
            await qb.syncProduct(product)
            progress.increment(1)
        }
        progress.stop()
        console.log("\n")
        console.log(chalk.green.bold("    all product variants synced successfully"))
        console.log("\n")
    }

    async catch(err) {
        console.log("\n")
        console.error(chalk.red.bold("    process encountered an error"))

        throw err
    }
}

SyncCommand.description = `Syncs Shopify product variants with Quickbooks
This command retrieves all product variants from Shopify, validates them
then syncs them with Quickbooks
`

SyncCommand.flags = {}

module.exports = SyncCommand