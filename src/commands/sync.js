const { Command, flags } = require("@oclif/command")
const { cli } = require("cli-ux")
const chalk = require("chalk")
const fs = require("fs-extra")
const path = require("path")
const {
    ShopifyEngine,
    QuickBooksEngine,
    validateProductVariants,
    logProductVariantValidationResults,
    parseProduct
} = require("quickbooks-sync")

class SyncCommand extends Command {
    async run() {
        const { flags: { debug, sandbox } } = this.parse(SyncCommand)

        const exists = await fs.pathExists(path.join(this.config.configDir, "config.json"))
        if (!exists) {
            console.error(chalk.yellow.bold("        could not locate credentials, please run 'qbsync configure'"))
            return
        }
        const config = await fs.readJSON(path.join(this.config.configDir, "config.json"))

        const sb = new ShopifyEngine(config.shopify)
        const qb = new QuickBooksEngine(sandbox ? {
            ...config.quickbooks_sandbox,
            debug,
            sandbox
        } : {
            ...config.quickbooks_production,
            debug,
            sandbox
        })

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

SyncCommand.flags = {
    debug: flags.boolean({ char: 'd', default: false }),
    sandbox: flags.boolean({ char: 's', default: false  })
}

module.exports = SyncCommand